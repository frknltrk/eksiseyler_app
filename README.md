# eksiseyler_app

## BUILD

```bash
$ git clone ... cd && eksiseyler_app/
$ cp .env.example .env 
# update the API URL inside .env
$ npm install
$ npx expo start
```

## TROUBLESHOOTING

- [Error: Runtime version policies are only supported in the managed workflow](https://github.com/expo/eas-cli/issues/1689)

## UPGRADE

```bash
$ npx expo-doctor
$ npx expo install --check
$ npm audit fix # optional
```
## TO DO
- [x] dark mode
- [x] share button
- [x] save the article
- [ ] offline read
- [ ] navigate forth
- [ ] search bar