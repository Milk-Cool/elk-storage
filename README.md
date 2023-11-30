# elk-storage
File storage on elk.letovo.ru

## Obtaining a token
1. Go to https://elk.letovo.ru using Chrome and log in as a Letovo student. Then open DevTools, go to the Application tab, then on the lefft side open Local Storage -> elk.letovo.ru. Copy the value of the `user-token` cookie. This is your token, you can use it to download or upload files.
> If you log out on elk.letovo.ru, you might need to update your token when you log back in.

## Downloading the program
You'll need to have both NodeJS and NPM installed.
```
git clone https://github.com/Milk-Cool/elk-storage.git
cd elk-storage
npm i
npm start
```
> The last step is required to generate the `files/` directory. You can close the program when it asks you for a token.

## Files directory
The `files/` directory is a local copy of all the files on your account. By syncing it, you can upload files to the "cloud" and download files from that "cloud". (The "cloud" here is the "social media" fields in your ELK account.)

## Syncing files
```
npm start
```
This will upload any missing files, download any files that are missing on your computer and update files based on when they were last modified.

## Limits
Total file size should be less than 15 MB (or ~14 MiB). If you want to be safe, use 14 MB (~13 MiB).
> If you hit the data limit, you might not be able to change your profile data on your ELK account unless you delete some of your files.