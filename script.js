document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const promptEl = document.getElementById('prompt');
    const terminal = document.getElementById('terminal');
    const inputLine = document.getElementById('input-line');

    let commandHistory = [];
    let historyIndex = -1;

    let state = {
        cwd: '/home/hacker'
    };
    
    // --- NUEVO SISTEMA DE ARCHIVOS Y CONTENIDOS ---

    const accessLogContent = `
127.0.0.1 - - [25/Aug/2025:16:10:01 +0200] "GET /login.php HTTP/1.1" 200 1572
8.8.8.8 - frank [25/Aug/2025:16:10:05 +0200] "GET /index.html HTTP/1.1" 200 3054
192.168.1.101 - - [25/Aug/2025:16:11:23 +0200] "GET /styles/main.css HTTP/1.1" 200 8824
8.8.4.4 - - [25/Aug/2025:16:11:24 +0200] "GET /img/logo.png HTTP/1.1" 200 15029
10.0.0.5 - bob [25/Aug/2025:16:12:50 +0200] "POST /api/submit HTTP/1.1" 200 48
8.8.8.8 - frank [25/Aug/2025:16:13:10 +0200] "GET /about.html HTTP/1.1" 200 2109
45.33.32.156 - - [25/Aug/2025:16:14:00 +0200] "GET /robots.txt HTTP/1.1" 404 198
45.33.32.156 - - [25/Aug/2025:16:14:01 +0200] "GET /wp-admin/ HTTP/1.1" 403 201
13.37.13.37 - - [25/Aug/2025:16:15:33 +0200] "GET /shell.php?cmd=id;--key=R3v3rs3_Th1s_C0d3 HTTP/1.1" 404 209 "-" "CTF{Gr3p_Fu_M4st3r}"
208.67.222.222 - - [25/Aug/2025:16:16:00 +0200] "GET /downloads/file.zip HTTP/1.1" 200 5489021
1.1.1.1 - - [25/Aug/2025:16:17:45 +0200] "GET /contact.html HTTP/1.1" 200 1987
192.168.1.1 - - [25/Aug/2025:16:18:02 +0200] "GET /favicon.ico HTTP/1.1" 200 1150
8.8.8.8 - frank [25/Aug/2025:16:18:15 +0200] "GET /products/item1 HTTP/1.1" 200 4501
10.0.0.6 - alice [25/Aug/2025:16:19:00 +0200] "POST /api/v2/update HTTP/1.1" 200 55
`.trim();

    const stringsCrackme = `
/lib64/ld-linux-x86-64.so.2
libc.so.6
puts
__cxa_finalize
__stack_chk_fail
main
GLIBC_2.2.5
95b30:4632047=70;0<:40=645167<:
@GCC: (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0
`.trim();

    const objdumpCrackme = `
0000000000400526 <main>:
  400526:   55                      push   %rbp
  400527:   48 89 e5                mov    %rsp,%rbp
  40052a:   48 83 ec 10             sub    $0x10,%rsp
  40052e:   64 48 8b 04 25 28 00    mov    %fs:0x28,%rax
  400535:   00 00
  400537:   48 89 45 f8             mov    %rax,-0x8(%rbp)
  40053b:   31 c0                   xor    %eax,%eax
  40053d:   48 8d 3d a0 00 00 00    lea    I2JHYkNEYjAlOWBEMHJfNWI=
  400544:   e8 d7 fe ff ff          callq  400420 <strcmp@plt>
  400549:   85 c0                   test   %eax,%eax
  40054b:   74 05                   je     400552 <main+0x2c>
  40054d:   bf 01 00 00 00          mov    $0x1,%edi
  400552:   b8 00 00 00 00          mov    $0x0,%eax
  ...
`.trim();

    const fileSystem = {
        '/home/hacker': {
            'welcome.txt': `Bienvenido a la terminal de ProtoCorp.
Hemos detectado actividad anómala y necesitamos tu ayuda.`,
            'crackme': `ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, not stripped`,
            'access.log': accessLogContent
        }
    };
    
    // --- NUEVOS COMANDOS SIMULADOS ---

    const commands = {
        help: () => `Comandos disponibles:
  help                    Muestra esta ayuda.
  ls                      Lista los archivos del directorio.
  cat <file>              Muestra el contenido de un archivo.
  less <file>             Permite navegar por un archivo.
  strings <file>          Muestra las cadenas de un archivo binario.
  objdump -d <file>       Desensambla un archivo binario.
  grep <pattern> <file>   Busca un patrón en un archivo.
  awk '<script>' <file>   Procesa texto de un archivo.
  clear                   Limpia la pantalla.`,
        ls: () => {
            return Object.keys(fileSystem[state.cwd]).join('\n');
        },
        cat: (args) => {
            const fileName = args[0];
            if (!fileName) return "Uso: cat <file>";
            const dir = fileSystem[state.cwd];
            if (dir && dir[fileName] !== undefined) {
                return dir[fileName];
            }
            return `cat: ${fileName}: No such file or directory`;
        },
        less: (args) => {
             const fileName = args[0];
            if (!fileName) return "Uso: less <file>";
            const dir = fileSystem[state.cwd];
            if (dir && dir[fileName] !== undefined) {
                return dir[fileName];
            }
            return `less: ${fileName}: No such file or directory`;
        },
        strings: (args) => {
            const fileName = args[0];
            if (!fileName) return "Uso: strings <file>";
            if (fileName === 'crackme') {
                return stringsCrackme;
            }
            return `strings: '${fileName}': No such file`;
        },
        objdump: (args) => {
            if (args.length !== 2 || args[0] !== '-d') {
                return "Uso: objdump -d <file>";
            }
            const fileName = args[1];
            if (fileName === 'crackme') {
                return objdumpCrackme;
            }
            return `objdump: '${fileName}': No such file`;
        },
        grep: (args) => {
            if (args.length !== 2) return "Uso: grep <pattern> <file>";
            const [pattern, fileName] = args;
            const dir = fileSystem[state.cwd];
            if (!dir || dir[fileName] === undefined) {
                return `grep: ${fileName}: No such file or directory`;
            }
            const fileContent = dir[fileName];
            const lines = fileContent.split('\n');
            const matches = lines.filter(line => line.includes(pattern));
            return matches.join('\n');
        },
        awk: (args) => {
            if (args.length !== 2) return "Uso: awk '<script>' <file>";
            const [script, fileName] = args;
             const dir = fileSystem[state.cwd];
            if (!dir || dir[fileName] === undefined) {
                return `awk: can't open file ${fileName}\n source line number 1`;
            }
            
            // Simulación muy básica para '/pattern/ {print $N}'
            const scriptMatch = script.match(/^\/'(.*)'\s*{\s*print\s*\$(\d+)\s*}$/);
            if (!scriptMatch) return `awk: syntax error at source line 1\n context is\n\t>>> ${script} <<<\n`;
            
            const [, pattern, col] = scriptMatch;
            const colIndex = parseInt(col, 10) - 1;
            
            const fileContent = dir[fileName];
            const lines = fileContent.split('\n');
            const matches = lines.filter(line => line.includes(pattern));
            
            const result = matches.map(line => {
                const columns = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
                return columns[colIndex] ? columns[colIndex].replace(/"/g, '') : '';
            });

            return result.join('\n');
        },
        clear: () => {
            output.innerHTML = '';
            return '';
        }
    };
    
    function parseCommand(str) {
        // Expresión regular para separar argumentos, respetando comillas simples y dobles.
        return str.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    }

    function processCommand(fullCmd) {
        if (!fullCmd.trim()) return;
        
        // Usar el nuevo parser de comandos
        const cleanedArgs = parseCommand(fullCmd.trim()).map(arg => arg.replace(/^['"]|['"]$/g, ""));
        const [command, ...args] = cleanedArgs;

        if (commands[command]) {
            const result = commands[command](args);
            if (result) printLine(result);
        } else {
            printLine(`${command}: command not found`);
        }
    }

    function printLine(text, isCommand = false) {
        const line = document.createElement('div');
        line.className = 'output-line';
        if (isCommand) {
            line.innerHTML = `<span class="prompt-display">${promptEl.textContent}</span> ${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
        } else {
            line.textContent = text;
        }
        output.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }
    
    function updatePrompt() {
        promptEl.textContent = 'hacker@protocorp:~$ ';
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value;
            printLine(command, true);
            if (command) {
                commandHistory.unshift(command);
            }
            historyIndex = -1;
            processCommand(command);
            input.value = '';
            terminal.scrollTop = terminal.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                input.value = '';
            }
        }
    });

    terminal.addEventListener('click', () => {
        input.focus();
    });

    async function init() {
        printLine("Estableciendo conexión SSH con 13.37.13.37...", false);
        await sleep(1500);
        printLine("Conexión establecida.", false);
        await sleep(500);
        printLine("Autenticando como 'hacker'...", false);
        await sleep(1000);
        printLine("Autenticación correcta. Bienvenido.", false);
        printLine("--------------------------------------------------", false);
        printLine(fileSystem[state.cwd]['welcome.txt']);
        updatePrompt();
        terminal.appendChild(inputLine);
        input.focus();
    }

    init();
});