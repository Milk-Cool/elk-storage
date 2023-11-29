const fs = require("fs");
const path = require("path");
const { question } = require("readline-sync");
const utimes = require("utimes");

const FILES = "files/";
const PREFIX = "~~STORAGE";

let token;

if(!fs.existsSync(FILES))
	fs.mkdirSync(FILES);
	
const parseFile = datastr => {
	const data = datastr.split("|");
	if(data[0] != PREFIX)
		return { "error": true, "data": datastr };
	return {
		"error": false,
		"name": atob(data[1]),
		"changed": parseInt(data[2]),
		"data": atob(data[3])
	};
};

const saveFile = (name, changed, data) => {
	return `${PREFIX}|${btoa(name)}|${changed.toString()}|${btoa(data)}`;
};
	
const get = async () => {
	const f = await fetch("https://elk.letovo.ru/api/me", {
		"method": "POST",
		"headers": {
			"Authorization": token,
			"Accept": "application/json"
		},
		"body": ""
	});
	const data = await f.json();
	return (data.user.socials || []).map(x => x.value).map(parseFile);
};
const uploadRaw = async arr => {
	const f = await fetch("https://elk.letovo.ru/api/user/me/save_settings_additional", {
		"method": "POST",
		"headers": {
			"Authorization": token,
			"Content-Type": "application/json"
		},
		"body": JSON.stringify({
			"socials": arr.map(x => ({ "value": x.error ? x.data : saveFile(x.name, x.changed, x.data) }))
		})
	});
	const t = await f.json();
}

const upload = async (prevDataArray, fpath) => {
	const file = parseFile(saveFile(path.basename(fpath), Math.floor(fs.statSync(fpath).ctimeMs), fs.readFileSync(fpath)));
	let flag = false;
	for(let i in prevDataArray)
		if(prevDataArray[i].name == file.name && file.changed > prevDataArray[i].changed) {
			prevDataArray[i] = file;
			flag = true;
		}
	if(!flag)
		prevDataArray.push(file);

	await uploadRaw(prevDataArray);
	return prevDataArray;
};

const main = async () => {
	token = question("Authorization token (including \"Bearer\"): ");
	
	const data = await get();
	let newData = JSON.parse(JSON.stringify(data));
	const names = data.map(x => x.name);
	const files = fs.readdirSync(FILES);
	const parsedFiles = files.map(x => path.join(FILES, x));
	for(let i in parsedFiles) {
		if(!names.includes(files[i])) {
			console.log(`Uploading file ${files[i]}...`);
			newData = await upload(newData, parsedFiles[i]);
			continue;
		}
		for(let j of data)
			if(!j.error && files[i] == j.name && Math.floor(fs.statSync(parsedFiles[i]).ctimeMs) > j.changed) {
				console.log(`Uploading file ${files[i]}...`);
				newData = await upload(newData, parsedFiles[i]);
			}
	}
	for(let i of data) {
		if(i.error) continue;
		const fname = path.join(FILES, i.name);
		if(!fs.existsSync(fname) || i.changed > Math.floor(fs.statSync(fname).ctimeMs)) {
			console.log(`Downloading file ${i.name}...`);
			fs.writeFileSync(fname, i.data);
			await utimes.utimes(fname, i.changed);
		}
	}
	console.log("Synced successfully!");
};
main();
