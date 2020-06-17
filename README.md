# Threejs_Estudo - Estudo sobre a biblioteca e exemplos resolvidos do livro

## Exemplos bem documentados e interessantes:

### Exemplos (2nd Edition - 2015):

- Repositório original dos exemplos: https://github.com/josdirksen/learning-threejs

### Exemplos (3rd Edition - 2018):

- Repositório original dos exemplos: https://github.com/PacktPublishing/Learn-Three.js-Third-Edition

#### Capítulo 09:
- 08

#### Capítulo 10:
- 02, 03, 04, 05, 06, 08, 21;

## Configurações de uso do servidor:
   **Alternativas:**

* Para executar os exemplos, especialmente os que tem textura e/ou carregamento de modelos externos, é preciso rodar em um servidor local por questão do sistema de segurança dos navegadores. 

**A) Servidor local python via WINDOWS:**

1) Faça o download do Python pelo link abaixo:
   ( https://www.python.org/downloads/ )
2) Instale o Python, lembrando-se de marcar a caixa "Add Python to PATH"
3) Após este processo, entre na prompt de comando do windows (CMD) ou powershell
3) A) Entrar no CMD ou powershell:
      I) aperte no teclado: "Simbolo do Windows + R"
      II) Aparecendo o executar, digite "**cmd**" ou "**powershell**"
4) Dentro do CMD ou powershell, vá para a pasta do projeto
   utilizar o comando: 
   cd diretorio do projeto --- Exemplo: cd: C:/git/projeto
5) Utilize o comando: 
   "**python -m http.server 8000 --bind 127.0.0.1**"
6) Feito corretamente, será inicializado o servido local python no seu computador
7) Para acessar o projeto, no navegador utilize a url: "**http://localhost:8000/**"


**B) Servidor local python via LINUX:**

1) Verificar se o Python instalado;
2) Abrir a pasta onde estão os códigos e de lá abrir um terminal e executar o seguinte:
   **python -m SimpleHTTPServer**
   ou 
   **python -m http.server**
   ou (executar o script criado)
   **sh PythonServer.sh**
3) Abre o browser e execute o seguinte link:
   **http://localhost:8000/**

**C) Extensão LiveServer:**

* Através do editor Visual Studio Code é possível criar um servidor temporário local apenas com a extensão
**"Live Server"**. Após a instalação, com o cursor do mouse sob o arquivo ".html" clique com o botão direito do mouse e no menu "Open With Live Server"

**D) Aplicativo WebServer:**

* Através do aplicativo **"Web Server for Chrome"** é possível determinar uma pasta para que ao executar um elemento, será inicializado de um servidor web local.


