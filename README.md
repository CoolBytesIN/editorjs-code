# Code block tool for Editor.js

This [Editor.js](https://editorjs.io/) block tool allows you to add code elements. It supports multiple languages for syntax highlighting (requires third-party libraries).

## Preview

#### Block Tool
![code](https://api.coolbytes.in/media/handle/view/image/312/)

#### Block Settings
![settings](https://api.coolbytes.in/media/handle/view/image/313/)

## Installation

**Using `npm`**

```sh
npm install @coolbytes/editorjs-code
```

**Using `yarn`**

```sh
yarn add @coolbytes/editorjs-code
```

## Usage

Include it in the `tools` property of Editor.js config:

```js
const editor = new EditorJS({
  tools: {
    code: Code
  }
});
```

## Config Params

|Field|Type|Optional|Default|Description|
|---|---|---|---|---|
|languages|`string[]`|`Yes`|_see list below_|All supported languages|
|defaultLanguage|`string`|`Yes`|`plaintext`|Preferred default language|

### Supported Languages

```
[
  'apache', 'applescript', 'bash', 'basic', 'csharp', 'c', 'cpp', 'cobol', 'css', 'coffeescript', 'cypher',
  'dart', 'dockerfile', 'dos', 'erlang', 'fortran', 'golang', 'gradle', 'graphql', 'groovy', 'gsql', 'html', 'xml',
  'haskell', 'json', 'java', 'javascript', 'julia', 'kotlin', 'lisp', 'lua', 'markdown', 'matlab', 'nginx',
  'objectivec', 'php', 'perl', 'plaintext', 'postgresql', 'powershell', 'puppet', 'python', 'ruby', 'rust', 'scss',
  'sql', 'scala', 'shell', 'swift', 'terraform', 'tsql', 'typescript', 'vbnet', 'vba', 'vbscript', 'vim', 'yaml', 'zephir'
]
```

### Custom Configuration

```js
const editor = EditorJS({
  tools: {
    code: {
      class: Code,
      config: {
        languages: ['plaintext', 'bash', 'sql'],
        defaultLanguage: 'plaintext'
      }
    }
  }
});
```

## Output data

|Field|Type|Description|
|---|---|---|
|code|`string`|Code content|
|language|`string`|Code language|

&nbsp;

Example:

```json
{
  "time": 1715969561758,
  "blocks": [
    {
      "id": "_K5QcJHHuK",
      "type": "code",
      "data": {
        "code": "This is some code",
        "language": "bash"
      }
    }
  ],
  "version": "2.29.1"
}
```