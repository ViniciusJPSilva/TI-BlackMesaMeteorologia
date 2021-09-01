
/**
 * COLOQUE A SUA KEY DA API AQUI.
 * Coloque-a entre aspas ("" ou '').
 */
var minhaChave = '';





var requisicao = new XMLHttpRequest();
var botaoRequisicao = document.querySelector("#botao_requisicao");

var secao_dadosClima = document.querySelector("#dados_clima");
var secao_dadosGerais = document.querySelector("#dados_gerais");
var secao_dadosGeograficos = document.querySelector("#dados_geograficos");
var nomeCidade;

/**
 * Simulando click no botão com a tecla enter
 */
document.addEventListener('keydown', function(e) {
    if(e.key == "Enter"){
      botaoRequisicao.click();
    }
});

/**
 * Realiza algumas operações ao pressionar do botão 'botao_requisicao'.
 */
botaoRequisicao.onclick = function(){
    nomeCidade = document.querySelector("#txt_cidade").value;

    //Verifica se o campo foi preenchido
    if(nomeCidade!=null && nomeCidade!=""){
        requisicao.onloadend = function(){ //Ao fim do carregamento.
            carregarRequisicao(true);
        }

        requisicao.onreadystatechange = function () { //Quando o estado da requisição é alterado
            if(this.readyState == this.DONE) { //Verifica se a requição está completamente carregada
                if(this.status == 200) { //Verifica o status da requisição
                    carregarRequisicao(false);
                    return;
                }
            }
        }

        requisicao.open('GET', 'https://api.openweathermap.org/data/2.5/weather?q=' + nomeCidade + '&units=metric&lang=pt_br&appid=' + minhaChave, true);
        requisicao.send(null);
    }else
        resetaLayout();
}

/**
 * Carrega a requisição e valida a resposta da API.
 */
function carregarRequisicao(armazenar){
    var resposta = JSON.parse(requisicao.responseText);
            
    //Verificando se a cidade existe
    if(resposta.cod != "404"){
        atualizaLayout(resposta);

        //Armazenar a pesquisa no localStorage
        if(armazenar) 
            armazenarLocalmente(nomeCidade.toLowerCase(), resposta.main.temp);
    }else
        resetaLayout();
}

/**
 * Deixa a página com o layout inicial e reseta alguns estilos css.
 */
function resetaLayout(){
    secao_dadosClima.style.display = "none";
    secao_dadosGerais.style.display = "none";
    secao_dadosGeograficos.style.display = "none";
    document.body.style.backgroundColor = "#CCC";
    resetaEstilo();
}

/**
 * Reseta alguns estilos css.
 */
function resetaEstilo(){
    //Background do body
    document.body.style.background = "";
    document.body.style.backgroundSize = "";

    //Cabeçalho e rodapé
    document.querySelector("#cabecalho").style.background = "" ;
    document.querySelector("#rodape").style.background = "" ;

    //Background das seções
    document.querySelector("#entrada_cidade").style.backgroundColor = "";
    secao_dadosClima.style.backgroundColor = "";
    secao_dadosGerais.style.backgroundColor = "";
    secao_dadosGeograficos.style.backgroundColor = "";

    //Cores e background específicos
    document.querySelector("#logo").style.color = "";
    document.querySelector("#logo span").style.color = "";
    document.querySelector("#rodape").style.color = ""
    document.querySelector("#botao_historico").style.background = "";
    document.querySelector("#botao_help").style.background = "";

    //Background do botão de requisicão
    document.querySelector('#botao_requisicao').classList.remove('blue');
    document.querySelector('#botao_requisicao').classList.remove('red');
    document.querySelector('#botao_requisicao').classList.add('grey');

    document.querySelector(".sidenav").style.backgroundColor = "#FFF";

    var img = document.querySelector(".background img");
    img.setAttribute('src', 'img/azul.jpg');
}

/**
 * Atualiza o leyout da página de acordo com os dados obtidos na requisição.
 */
function atualizaLayout(resposta){
    var temperatura = resposta.main.temp; //Temperatura atual
                
    //Alterando o display das seções
    secao_dadosClima.style.display = "block";
    secao_dadosGerais.style.display = "block";
    secao_dadosGeograficos.style.display = "block";

    //Temperatura Atual
    document.querySelector("#temp_atual").textContent = parseFloat(temperatura.toFixed(0)) + "°";

    //Temperatura Mínima
    document.querySelector("#temp_min").textContent = "Mínima: " + parseFloat((resposta.main.temp_min).toFixed(0)) + "°"; 

    //Temperatura Máxima
    document.querySelector("#temp_max").textContent = "Máxima: " + parseFloat((resposta.main.temp_max).toFixed(0)) + "°"; 
    
    //Descrição
    document.querySelector("#descricao").textContent = resposta.weather[0].description; 

    //Imagem do clima
    document.querySelector("#imagem_clima").src = "http://openweathermap.org/img/wn/" + resposta.weather[0].icon + "@2x.png";
    document.querySelector("#imagem_clima").style.backgroundSize = "cover";

    //Nascer e Pôr do Sol
    document.querySelector("#nascer_sol").textContent = "Nascer do Sol: " + timestampToHora(resposta.sys.sunrise, resposta.timezone);
    document.querySelector("#por_sol").textContent = "Pôr do Sol: " + timestampToHora(resposta.sys.sunset, resposta.timezone);

    //Humidade
    document.querySelector("#humidade").textContent = "Humidade: " + parseFloat((resposta.main.humidity).toFixed(0)) + "%";

    //Vento
    document.querySelector("#vento").textContent = "Vento: " + parseFloat((resposta.wind.speed * 3.6).toFixed(0)) + " km/h";

    //Latitude
    var coordenadas = grauDecimalToGMS(resposta.coord.lat, resposta.coord.lon);
    document.querySelector("#latitude").textContent = "Latitude: " + coordenadas[0];

    //Longitude
    document.querySelector("#longitude").textContent = "Longitude: " + coordenadas[1];

    //Distância até Brasília
    document.querySelector("#distancia_brasilia").textContent = "Distância da cidade até Brasília: " + distanciaPorCoordenadas(resposta.coord.lat, resposta.coord.lon, -15.7797, -47.9297).toFixed(2) + " Km";

    /*Altera o Plano de Fundo*/
    alterarPlanoDeFundo(temperatura);

}//Função atualizaLayout()

/**
 * Converte um timestamp para Date e retorna as horas no formato 'HH:MM'. 
 */
function timestampToHora(tstamp, fusoHorario){
    var data = new Date(tstamp * 1000); //Alterando o timestamp para o padrão do JS.

    var horario = data.getUTCHours() * 3600 + data.getUTCMinutes() * 60 + fusoHorario; //Atualizando a hora de acordo com o fuso horário da cidade.
   
    if(horario < 0) horario += 24 * 3600; //Ajustando o horário caso ocorra a diferença de um dia.

    var hora = Math.trunc(horario / 3600); //Obtendo as horas.
    var minutos = (horario % 3600) / 60; //Obtendo os minutos.

    //Padronizando o formato (dois caracteres).
    hora = padronizadorDoisDigitos(hora);
    minutos = padronizadorDoisDigitos(minutos);

    return hora + ":" + minutos; //Retorno
}

/**
 * Recebe um valor inteiro entre 0 e 99 e retorna o mesmo com dois digitos.
 */
function padronizadorDoisDigitos(valor){
    return (valor <= 9) ? '0' + valor:valor;
}

/**
 * Transforma coordenadas de graus decimais para graus, minutos e segundos (GMS).
 */
function grauDecimalToGMS(latitude, longitude){
    var sentido;
    if(latitude < 0){ //Verifica o sentido da latitude (Norte ou Sul).
        sentido = "S";
        latitude *= -1; //Inverte o sinal para futuros cálculos.
    }else{
        sentido = "N";
    }

    var graus = Math.trunc(latitude); //Calcula os graus
    var minutos = Math.trunc((latitude - Math.trunc(latitude)) * 60); //Calcula os minutos
    var segundos = latitude - Math.trunc(latitude) - Math.trunc((latitude - Math.trunc(latitude))); //Calcula os segundos

    var coordenadaLat = graus + "° " + minutos + "\' " + segundos.toFixed(1) + "\" " + sentido; //Gera uma string GMS para a latitude.

    if(longitude < 0){ //Verifica o sentido da longitude (Leste ou Oeste).
        sentido = "O";
        longitude *= -1; //Inverte o sinal para futuros cálculos.
    }else{
        sentido = "L";
    }

    graus = Math.trunc(longitude); //Calcula os graus
    minutos = Math.trunc((longitude - Math.trunc(longitude)) * 60); //Calcula os minutos
    segundos = longitude - Math.trunc(longitude) - Math.trunc((longitude - Math.trunc(longitude))); //Calcula os segundos

    var coordenadaLon= graus + "° " + minutos + "\' " + segundos.toFixed(1) + "\" " + sentido; //Gera uma string GMS para a longitude.
    
    return [coordenadaLat, coordenadaLon]; //Retorna um array de strings com a latitude GMS e a longitude GMS.
}//função grauDecimalToGMS()

/**
* Calcula a distância, em quilômetros (Km), entre dois pontos geográficos.
*/
function distanciaPorCoordenadas(latitude01, longitude01, latitude02, longitude02){
    var dla = (latitude01 >= latitude02) ? latitude01 - latitude02 : latitude02 - latitude01; //Calcula a diferença de latitude.
    var dlo = (longitude01 >= longitude02) ? longitude01 - longitude02 : longitude02 - longitude01; //Calcula a diferença de longitude.

    //Converte a diferença de latitude e longitude de graus decimais para quilômetros.
    dla = (Math.trunc(dla) * 60 + Math.trunc((dla - Math.trunc(dla)) * 60) + (dla - Math.trunc(dla) - Math.trunc((dla - Math.trunc(dla)))) / 60) * 1852 / 1000; 
    dlo = (Math.trunc(dlo) * 60 + Math.trunc((dlo - Math.trunc(dlo)) * 60) + (dlo - Math.trunc(dlo) - Math.trunc((dlo - Math.trunc(dlo)))) / 60) * 1852 / 1000;

    //Utiliza o teorema de pitágoras (distancia² = dla² + dlo²) para calcular a distância aproximada entre os dois pontos.
    return Math.sqrt(dla * dla + dlo * dlo);
}

/**
* Altera o plano de fundo baseado em uma temperatura.
*/
function alterarPlanoDeFundo(temperatura){
    var limiteMax = 40;
    var limiteMin = 0;

    resetaEstilo(); //Reseta o estilo css.

    if(temperatura >= limiteMin && temperatura <= limiteMax){ //Verificando se a temperatura da cidade está no limite pré-determinado.
        var padraoHexa = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']; //Valores Hexadecimais.
        document.body.style.backgroundColor = '#' + padraoHexa[Math.trunc(temperatura/3)] + '0' + padraoHexa[16 - Math.trunc(temperatura/3)]; //Gerando uma cor de background
    }else{
        if(temperatura < limiteMin){
            if(temperatura > -30){
                document.body.style.backgroundColor = "#00BFFF";
            }else{
                //Estilo personalizado para temperaturas abaixo de -30°C.
                document.body.style.background = "#ADD8E6 url(img/lichking.jpg) no-repeat fixed";
                document.body.style.backgroundSize = "cover";
                
                document.querySelector("#cabecalho").style.background = "none" ;
                document.querySelector("#rodape").style.background = "none" ;

                document.querySelector("#entrada_cidade").style.backgroundColor = "#00BFFF";
                secao_dadosClima.style.backgroundColor = "#00BFFF";
                secao_dadosGerais.style.backgroundColor = "#00BFFF";
                secao_dadosGeograficos.style.backgroundColor = "#00BFFF";

                document.querySelector("#rodape").style.color = "#000"
                document.querySelector("#botao_historico").style.background = "#00BFFF";
                document.querySelector("#botao_help").style.background = "#00BFFF";

                document.querySelector(".sidenav").style.backgroundColor = "#6ADAFF";
                
                document.querySelector('#botao_requisicao').classList.remove('grey');
                document.querySelector('#botao_requisicao').classList.add('blue');

                var img = document.querySelector(".background img");
                img.setAttribute('src', 'img/neve.jpeg');
            }
        }else{
            if(temperatura <= 40){
                document.body.style.backgroundColor = "#F00";
            }else{
                //Estilo personalizado para temperaturas acima de 40°C.
                document.body.style.background = "#000 url(img/mordor.jpg) no-repeat fixed";
                document.body.style.backgroundSize = "cover";

                document.querySelector("#cabecalho").style.background = "none" ;
                document.querySelector("#rodape").style.background = "none" ;

                document.querySelector("#entrada_cidade").style.backgroundColor = "#FF8C00";
                secao_dadosClima.style.backgroundColor = "#FF8C00";
                secao_dadosGerais.style.backgroundColor = "#FF8C00";
                secao_dadosGeograficos.style.backgroundColor = "#FF8C00";

                document.querySelector("#logo").style.color = "#FFF";
                document.querySelector("#logo span").style.color = "#FF8C00";
                document.querySelector("#rodape").style.color = "#FF8C00"
                document.querySelector("#botao_historico").style.background = "#FF8C00";
                document.querySelector("#botao_help").style.background = "#FF8C00";

                document.querySelector('#botao_requisicao').classList.remove('grey');
                document.querySelector('#botao_requisicao').classList.add('red');

                document.querySelector(".sidenav").style.backgroundColor = "#FFB65C";

                var img = document.querySelector(".background img");
                img.setAttribute('src', 'img/sol.jpg');
            }
        }
    }
}//função alterarPlanoDeFundo()

/**
 *  Armazena dados no local Storage.
 *  > Nome da cidade.
 *  > Temperatura.
 *  > Data da pesquisa.
 *  > Hora da pesquisa.
 */
function armazenarLocalmente(nome, temperatura){
    if(suportaLocalStorage){
        var data = new Date();

        var dataAtual = padronizadorDoisDigitos(data.getDate()) + '/' + padronizadorDoisDigitos((data.getMonth()+1)) + '/' + data.getFullYear();
        var horaAtual = padronizadorDoisDigitos(data.getHours()) + ':' + padronizadorDoisDigitos(data.getMinutes()) + ':' + padronizadorDoisDigitos(data.getSeconds());

        nome = nome[0].toUpperCase() + nome.substr(1);
        var novoItem = {'cidade' : nome, 'temperatura' : temperatura + ' °C', 'data' : dataAtual, 'hora' : horaAtual};
        localStorage.setItem(localStorage.length + 1, JSON.stringify(novoItem))
    }
}

/**
 * Verifica se o navegador do usuário suporta localStorage.
 */
function suportaLocalStorage(){
    try{
        return 'localStorage' in window && window['localStorage'] !== null;
    }catch (e){
        return false;
    }
}

/**
 * Manipula o pop up (modal) de ajuda.
 */
var popUpAjuda = document.querySelectorAll('.modal');
var intanciasPopUpAjuda = M.Modal.init(popUpAjuda);

/**
 * Manipula o menu lateral (histórico).
 */
var menuLateral = document.querySelectorAll('.sidenav');
var instanciasMenuLateral = M.Sidenav.init(menuLateral);

/**
 * Insere linhas na tabela de histórico.
 */
function inserirLinhaNoHistorico(dados){
    var tabela = document.querySelector("#tabela_historico");

    var numLinhas = tabela.rows.length;
    var numColunas = tabela.rows[numLinhas - 1].cells.length;
    var novaLinha = tabela.insertRow(numLinhas);

    for (var col = 0; col < numColunas; col++) {
        newCell = novaLinha.insertCell(col);

        switch(col){
            case 0:
                newCell.innerHTML =  dados.cidade;
                break;
            case 1:
                newCell.innerHTML =  dados.temperatura;
                break;
            case 2:
                newCell.innerHTML =  dados.data;
                break;
            case 3:
                newCell.innerHTML =  dados.hora;
                break; 
        }
    }
}

/**
 * Limpa os dados da tabela do historico.
 */
function limparTabelaHistorico(){
    var tabela = document.querySelector("#tabela_historico");
    var rowCount = tabela.rows.length;
    for (var x=rowCount-1; x>0; x--) {
        tabela.deleteRow(x);
    }
}

/**
 * Limpa o localStorage.
 */
document.querySelector("#confirmar_limpeza_historico").onclick = function(){
    localStorage.clear();
    limparTabelaHistorico();
}

/**
 * Abre o menu lateral com o historico de pesquisas.
 */
document.querySelector("#botao_historico").onclick = function(){
    limparTabelaHistorico();

    if(localStorage.length > 0 && suportaLocalStorage()){
        for(var i = 1; i <= localStorage.length; i++){
            inserirLinhaNoHistorico(JSON.parse(localStorage[i]));
        }
    }
};