A \<create\> repo for creating configurable package.json file.

### Features

- no `test` script any more
  ```diff
  -  "test": "echo \"Error: no test specified\" && exit 1"
  ```
- configure `prettier` by default
- reuse remote `package.json` file to configure you `scripts` field
- support configuring `bundler` `typescript` ...(developing)

### Basic Usage

Create a new directory, then run this command:

```bash
npm init @npmcreate
```

By default, we will configure `prettier` to:

```json
{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true
}
```

### Configure Options

1. configure bundler: `parcel | esbuild | webpack | rollup`
   ```bash
   npm init @npmcreate --bundler parcel
   ```
2. configure typescript: `true | false`
   ```bash
   npm init @npmcreate --ts true
   ```
3. configure scripts and prettier with remote package.json file

   ```bash
   npm init @npmcreate --remote https://raw.githubusercontent.com/npmcreate/create/master/package.json
   ```

   This will rewrite `package.json`'s `scripts` and `prettier` fields based on the remote file content
