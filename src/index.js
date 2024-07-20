require('./index.css');

const codeIcon = require('./icons/code.js');
const copyIcon = require('./icons/copy.js');

/**
 * Code plugin for Editor.js
 * Supported config:
 *     * languages {string[]} (Default: Code.LANGUAGES)
 *     * defaultLanguage {string} (Default: plaintext)
 *
 * @class Code
 * @typedef {Code}
 */
export default class Code {
  /**
   * Editor.js Toolbox settings
   *
   * @static
   * @readonly
   * @type {{ icon: any; title: string; }}
   */
  static get toolbox() {
    return {
      icon: codeIcon, title: 'Code',
    };
  }

  /**
   * To notify Editor.js core that read-only is supported
   *
   * @static
   * @readonly
   * @type {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the block tool
   *
   * @static
   * @readonly
   * @type {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * All supported languages
   *
   * @static
   * @readonly
   * @type {string[]}
   */
  static get LANGUAGES() {
    return [
      'apache', 'applescript', 'bash', 'basic', 'csharp', 'c', 'cpp', 'cobol', 'css', 'coffeescript', 'cypher',
      'dart', 'dockerfile', 'dos', 'erlang', 'fortran', 'golang', 'gradle', 'graphql', 'groovy', 'gsql', 'html', 'xml',
      'haskell', 'json', 'java', 'javascript', 'julia', 'kotlin', 'lisp', 'lua', 'markdown', 'matlab', 'nginx',
      'objectivec', 'php', 'perl', 'plaintext', 'postgresql', 'powershell', 'puppet', 'python', 'ruby', 'rust', 'scss',
      'sql', 'scala', 'shell', 'swift', 'terraform', 'tsql', 'typescript', 'vbnet', 'vba', 'vbscript', 'vim', 'yaml', 'zephir'
    ];
  }

  /**
   * All supported languages names
   *
   * @static
   * @readonly
   * @type {string[]}
   */
  static get LANGUAGE_NAMES() {
    return [
      'Apache', 'AppleScript', 'Bash', 'Basic', 'C#', 'C', 'C++', 'COBOL', 'CSS', 'CoffeeScript', 'Cypher (Neo4j)',
      'Dart', 'Dockerfile', 'DOS', 'Erlang', 'Fortran', 'Go', 'Gradle', 'GraphQL', 'Groovy', 'GSQL', 'HTML', 'XML',
      'Haskell', 'JSON', 'Java', 'JavaScript', 'Julia', 'Kotlin', 'Lisp', 'Lua', 'Markdown', 'Matlab', 'Nginx',
      'Objective C', 'PHP', 'Perl', 'Plaintext', 'PostgreSQL', 'PowerShell', 'Puppet', 'Python', 'Ruby', 'Rust', 'SCSS',
      'SQL', 'Scala', 'Shell', 'Swift', 'Terraform', 'Transact-SQL', 'TypeScript', 'VB.Net', 'VBA', 'VBScript', 'Vim Script',
      'YAML', 'Zephir'
    ];
  }

  /**
   * Default language
   *
   * @static
   * @readonly
   * @type {string}
   */
  static get DEFAULT_LANGUAGE() {
    return 'plaintext';
  }

  /**
   * Automatic sanitize config for Editor.js
   *
   * @static
   * @readonly
   * @type {{ code: {}; language: boolean; }}
   */
  static get sanitize() {
    return {
      code: true, // Allow HTML Tags
      language: false
    };
  }

  /**
   * Editor.js config to convert one block to another
   *
   * @static
   * @readonly
   * @type {{ export: string; import: string; }}
   */
  static get conversionConfig() {
    return {
      export: 'code', // this property of tool data will be used as string to pass to other tool
      import: 'code', // to this property imported string will be passed
    };
  }

  /**
   * Creates an instance of Code.
   *
   * @constructor
   * @param {{ api: {}; readOnly: boolean; config: {}; data: {}; }} props
   */
  constructor({
    api, readOnly, config, data,
  }) {
    this._api = api;
    this._readOnly = readOnly;
    this._config = config || {};
    this._data = this._normalizeData(data);
    this._CSS = {
      wrapper: 'ce-code',
      terminalBar: 'ce-terminal-bar',
      terminalRed: 'ce-terminal-red',
      terminalYellow: 'ce-terminal-yellow',
      terminalGreen: 'ce-terminal-green',
      terminalOptions: 'ce-terminal-options',
      terminalLanguage: 'ce-terminal-language'
    };
    this._element = this._getElement();
  }

  /**
   * All available languages
   * - Finds intersection between supported and user selected languages
   *
   * @readonly
   * @type {string[]}
   */
  get availableLanguages() {
    return this._config.languages ? Code.LANGUAGES.filter(
      (language) => this._config.languages.includes(language),
    ) : Code.LANGUAGES;
  }

  /**
   * User's default language
   * - Finds union of user choice and the actual default
   *
   * @readonly
   * @type {string}
   */
  get userDefaultLanguage() {
    if (this._config.defaultLanguage) {
      const userSpecified = this.availableLanguages.find(
        (language) => language === this._config.defaultLanguage,
      );
      if (userSpecified) {
        return userSpecified;
      }
      // eslint-disable-next-line no-console
      console.warn('(ง\'̀-\'́)ง Code Tool: the default language type specified is invalid');
    }
    return Code.DEFAULT_LANGUAGE;
  }

  /**
   * To normalize input data
   *
   * @param {*} data
   * @returns {{ code: string; language: string; }}
   */
  _normalizeData(data) {
    const newData = {};
    if (typeof data !== 'object') {
      data = {};
    }

    newData.code = data.code || '';
    newData.language = data.language || this.userDefaultLanguage;
    return newData;
  }

  /**
   * Current alignment type
   *
   * @readonly
   * @type {string}
   */
  get currentLanguage() {
    let selectedLanguage = this.availableLanguages.find((language) => language === this._data.language);
    if (!selectedLanguage) {
      selectedLanguage = this.userDefaultLanguage;
    }
    return selectedLanguage;
  }

  /**
   * Helper function to create a DIV with a specific class
   *
   * @param {*} className
   * @returns {*}
   */
  _createDivWithClass = (className) => {
    const div = document.createElement('DIV');
    div.classList.add(className);
    return div;
  };

  /**
   * Create and return block element
   *
   * @returns {*}
   */
  _getElement() {
    const parentDiv = this._createDivWithClass(this._CSS.wrapper);
    
    // Terminal bar and its elements
    const terminalBar = this._createDivWithClass(this._CSS.terminalBar);
    const terminalRed = this._createDivWithClass(this._CSS.terminalRed);
    const terminalYellow = this._createDivWithClass(this._CSS.terminalYellow);
    const terminalGreen = this._createDivWithClass(this._CSS.terminalGreen);
    const terminalOptions = this._createDivWithClass(this._CSS.terminalOptions);
    const terminalLanguage = this._createDivWithClass(this._CSS.terminalLanguage);
    terminalLanguage.innerHTML = this.currentLanguage;

    // Copy Code Button
    const copyButton = document.createElement('span');
    copyButton.classList.add('ce-copy-btn');
    copyButton.innerHTML = copyIcon;
    const copyToolTip = this._createDivWithClass('ce-copy-tooltip');
    copyToolTip.innerHTML = 'Copied!';
    copyButton.appendChild(copyToolTip);
    copyButton.addEventListener('click', (event) => this._copyCode(event));

    terminalOptions.appendChild(copyButton);
    terminalOptions.appendChild(terminalLanguage);

    // Append all children to Terminal bar
    terminalBar.appendChild(terminalRed);
    terminalBar.appendChild(terminalYellow);
    terminalBar.appendChild(terminalGreen);
    terminalBar.appendChild(terminalOptions);

    // <pre> tag to wrap the code block
    const preDiv = document.createElement('PRE');
    preDiv.contentEditable = !this._readOnly;
    preDiv.addEventListener("paste", (event) => this._onPaste(event));
    preDiv.addEventListener('keydown', (event) => {
      if (event.code === 'Tab') {
        this._tabHandler(event);
      }
    });

    // Code block
    this._codeBlock = document.createElement('CODE');
    this._codeBlock.setAttribute('language', this.currentLanguage);
    this._codeBlock.textContent = this._data.code || '';
    preDiv.appendChild(this._codeBlock);

    parentDiv.appendChild(terminalBar);
    parentDiv.appendChild(preDiv);
    return parentDiv;
  }

  /**
   * Handle copy code onclick event
   *
   * @param {KeyboardEvent} event
   */
  _copyCode(event) {
    if (this._codeBlock) {
      navigator.clipboard.writeText(this._codeBlock.textContent)
      .then(() => {
        const tooltip = event.target.parentElement.lastChild;
        tooltip.classList.add('visible');

        setTimeout(() => {
          tooltip.classList.remove('visible');
        }, 3000);
      })
      .catch(() => { alert("Unable to copy"); });
    }
  }

  /**
   * Handle pasted content (not the Editor.js Paste Substitution)
   *
   * @param {KeyboardEvent} event
   */
  _onPaste(event) {
    event.stopPropagation();
    event.preventDefault();
    const clipboardText = event.clipboardData.getData('Text');

    // Extracting the current selection attributes
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const codeContent = this._codeBlock.textContent;

    // Breaking the code content into 3 parts (before selection, selection, after selection)
    const beforeSelection = codeContent.slice(0, startOffset);
    const selectionText = codeContent.slice(startOffset, endOffset);
    const afterSelection = codeContent.slice(endOffset);

    // Update the code selection, for further tab key events
    this._codeBlock.textContent = beforeSelection + clipboardText + afterSelection;
    const lengthChange = clipboardText.length - selectionText.length;
    this._setSelection(this._codeBlock, startOffset, endOffset + lengthChange);
  }

  /**
   * Callback for Code language block tune setting
   *
   * @param {string} newLanguage
   */
  _setLanguage(newLanguage) {
    this._data.language = newLanguage;
    this._element.querySelector('.ce-terminal-language').innerHTML = this.currentLanguage;
    this._codeBlock.setAttribute('language', this.currentLanguage);
  }

  /**
   * HTML element to render on the UI by Editor.js
   *
   * @returns {*}
   */
  render() {
    return this._element;
  }

  /**
   * Editor.js save method to extract block data from the UI
   *
   * @param {*} blockContent
   * @returns {{ code: string; language: string; }}
   */
  save() {
    return {
      code: this._codeBlock?.textContent || '',
      language: this.currentLanguage,
    };
  }

  /**
   * Editor.js validation (on save) code for this block
   * - Skips empty blocks
   *
   * @param {*} savedData
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  validate(savedData) {
    return savedData.code.trim() !== '';
  }

  /**
   * Get formatted label for Block settings menu
   *
   * @param {string} language
   * @returns {string}
   */
  _getFormattedLabel(language) {
    const langIndex = Code.LANGUAGES.indexOf(language);
    if (langIndex && langIndex !== -1) {
      return Code.LANGUAGE_NAMES[langIndex];
    }
    return this._api.i18n.t(language.charAt(0).toUpperCase() + language.slice(1));
  }

  /**
   * Block Tunes Settings
   *
   * @returns {[{*}]}
   */
  renderSettings() {
    return this.availableLanguages.map((language) => ({
      icon: codeIcon,
      label: this._getFormattedLabel(language),
      onActivate: () => this._setLanguage(language),
      isActive: language === this.currentLanguage,
      closeOnActivate: true,
      toggle: 'language',
    }));
  }

  /**
   * Editor.js method to merge similar blocks on `Backspace` keypress
   *
   * @param {*} data
   */
  merge(data) {
    if (this._codeBlock) {
      this._codeBlock.textContent = this._codeBlock.textContent + data.code || '';
    }
  }

  /**
   * To update the current selection with new positions
   *
   * @param {HTMLElement} element
   * @param {number} start
   * @param {number} end
   */
  _setSelection(element, start, end) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(element.firstChild, start < 0 ? 0 : start);
    range.setEnd(element.firstChild, end < 0 ? element.firstChild.textContent.length : end);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /**
   * Handles Tab key pressing (adds/removes indentations)
   *
   * @param {KeyboardEvent} event
   */
  _tabHandler(event) {
    event.stopPropagation();
    event.preventDefault();

    // Extracting the current selection attributes
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const codeContent = this._codeBlock.textContent;

    // Breaking the code content into 3 parts (before selection, selection, after selection)
    const startLineStartIndex = codeContent.lastIndexOf('\n', startOffset - 1) + 1;
    const endLineEndIndex = codeContent.indexOf('\n', endOffset);
    const adjustedEndLineEndIndex = endLineEndIndex === -1 ? codeContent.length : endLineEndIndex;
    const beforeSelection = codeContent.slice(0, startLineStartIndex);
    const selectionText = codeContent.slice(startLineStartIndex, adjustedEndLineEndIndex);
    const afterSelection = codeContent.slice(adjustedEndLineEndIndex);

    let newSelectionText;
    if (event.shiftKey) {
      // Handle Shift+Tab (Remove indentation)
      newSelectionText = selectionText.replace(/^ {4}/gm, '');
    } else {
      // Handle Tab (Add indentation)
      newSelectionText = selectionText.replace(/^/gm, '    ');
    }

    // Update the code selection, for further tab key events
    this._codeBlock.textContent = beforeSelection + newSelectionText + afterSelection;
    const lengthChange = newSelectionText.length - selectionText.length;
    this._setSelection(this._codeBlock, startLineStartIndex, adjustedEndLineEndIndex + lengthChange);
  }
}