# Prompt da criação base da tela dashboard

Essa tela de pagina inicial da recepcionista.  
Use HTML, CSS, JavaScript e Bootstrap dentro do asp.net

crie os seguintes arquivos considerando as estrutura de pastas:  
recepcionista/dashboard.html  
css/recepcionista/dashboard.css  
js/recepcionista/dashboard.js  

## A tela possui:

- uma sidebar a esquerda
- a sidebar bar contem Logo + "Dentus's clinic" no topo com uma risca abaixo
- na sidebar, abaixo da risca, há um retangulo vertical com cargo e Nome ao lado direito do retangulo.
- na side bar tem a opção "Pagina inicial" selecionada
- na side bar tem a opção "Consulta"
- na side bar tem a opção "pacientes"
- na side bar tem a opção "funcionários"
- na parte inferior a side bar há uma risca, e abaixo da risca há um botão de configurações
- abaixo do botão configurações da sidebar há o botão de sair
- no conteúdo da pagina há uma lista com titulo de "consultas do dia" contendo "nome do paciente", "Hora", "Doutor responsável", "Serviço Odontológico" e "status"
- a coluna status deve conter nas informações setas a esquerda e direita da frase, permitindo alterar status
- no conteúdo da pagina contem o botão "agendar consulta" alinhado a esquerda vertical da lista de consultas do dia
- no conteudo da pagina contem o botão "visualizar paciente" e "cadastrar paciente" alinhado a direita vertical da lista de consultas do dia
- componentize a side bar para uso futuro em outras telas

## Regras

- os campos de status devem alternar na ordem "agendada", "em fila", "em consulta" e "Consulta encerrada", e o status "cancelada" que não contem as setas de alteração de status
- layout responsivo

## Paletas

- .color1 {color: #6e5430;}
- .color2 {color: #8a783f;}
- .color3 {color: #beb48b;}
- .color4 {color: #e7e7db;}
- .color5 {color: #f9f9f9;}