# eksiseyler_app

## BUILD

```bash
$ git clone ... cd && eksiseyler_app/
# update the API URL inside .env.example
$ mv .env.example .env
$ npx expo start
```

## DEVELOPMENT

## TROUBLESHOOTING

- [Error: Runtime version policies are only supported in the managed workflow](https://github.com/expo/eas-cli/issues/1689)

## UPGRADE

```bash
$ npx expo-doctor
$ npx expo install --check
$ npm audit fix # optional
```
