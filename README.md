# Threejs_Estudo - Estudo sobre a biblioteca e exemplos resolvidos do livro

## Exemplos bem documentados e interessantes:
1) Exemplos (3rd Edition - 2018)/src/Capitulo_09/09.08-morph-targets.html

## Configurações de uso do servidor:
   **Alternativas:**

**A) Servidor local python via linux:**

* Para executar os exemplos, especialmente os que tem textura e/ou carregamento de modelos externos, é preciso rodar em um servidor local por questão do sistema de segurança dos navegadores. 

* Uma possibilidade interessante é utilizar um servidor Python. Para tal, tem que fazer o seguinte (Linux):

1) Verificar se o Python instalado;
2) Abrir a pasta onde estão os códigos e de lá abrir um terminal e executar o seguinte:
   python -m SimpleHTTPServer
   ou 
   python -m http.server
   ou (executar o script criado)
   sh PythonServer.sh
3) Abre o browser e execute o seguinte link:
   http://localhost:8000/

**B) Extensão LiveServer:**

* Através do editor Visual Studio Code é possível criar um servidor temporário local apenas com a extensão
**"Live Server"**. Após a instalação, com o cursor do mouse sob o arquivo ".html" clique com o botão direito do mouse e no menu "Open With Live Server"

**C) Aplicativo WebServer:**

* Através do aplicativo **"Web Server for Chrome"** é possível determinar uma pasta para que ao executar um elemento, será inicializado de um servidor web local.


