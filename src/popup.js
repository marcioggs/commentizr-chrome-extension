var BASE_URL = "http://localhost:8080/commentizr-app/";
var URL_INICIAR_CRIAR_CONTA = BASE_URL + "login/iniciarCriarConta.do";
var URL_CRIAR_CONTA = BASE_URL + "login/criarConta.do";
var URL_INICIAR_ENVIAR_EMAIL_RECUPERACAO_CONTA = BASE_URL + "login/iniciarEnviarEmailRecuperacaoConta.do";
var URL_ENVIAR_EMAIL_RECUPERACAO_CONTA = BASE_URL + "login/enviarEmailRecuperacaoConta.do";
var URL_PROCESSAR_LOGIN = BASE_URL + "login/processarLogin.do";
var URL_OBTER_COMENTARIOS = BASE_URL + "obterComentarios.do";
var URL_INSERIR_COMENTARIO = BASE_URL + "inserirComentario.do";
var URL_LIKAR_COMENTARIO = BASE_URL + "likarComentario.do";
var URL_DISLIKAR_COMENTARIO = BASE_URL + "dislikarComentario.do";
var URL_EXIBIR_RESPOSTAS = BASE_URL + "exibirRespostas.do";
var URL_INSERIR_RESPOSTA = BASE_URL + "inserirResposta.do";
var URL_LIKAR_RESPOSTA = BASE_URL + "likarResposta.do";
var URL_DISLIKAR_RESPOSTA = BASE_URL + "dislikarResposta.do";

$(document).ready(function() {
	configurarAjax();
	vincularEventosBotoes();
	obterComentarios();
});

/**
 * Configurar chamadas Ajax.
 */
function configurarAjax() {
	$.ajaxSetup({
		type: "POST",
		cache: false
	});
	
	$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
		if (jqXHR.status == 409) {
			exibirErrosNegocio(jqXHR.responseText);
		} else {
			//TODO: Ajeitar mensagem
			alert(jqXHR.status + " - " + jqXHR.statusText);
		}
	});
	
	$(document).ajaxSuccess(function(event, xhr, settings) {
		$("#erros").empty();
	});
}

/**
 * Vincula os eventos disparados pelos botões.
 */
function vincularEventosBotoes() {
	$(document).on("click", "#btIniciarCriarConta", function() {
		$("#conteudo").load(URL_INICIAR_CRIAR_CONTA);
	});
	
	$(document).on("click", "#btCriarConta", function() {
		$.ajax({
			url: URL_CRIAR_CONTA,
			data: $("#frmCriarConta :input").serialize(),
			success: function(data) {
				$("#conteudo").html(data);
			}
		});
	});
	
	$(document).on("click", "#btIniciarEnviarEmailRecuperacaoConta", function() {
		$("#conteudo").load(URL_INICIAR_ENVIAR_EMAIL_RECUPERACAO_CONTA);
	});
	
	$(document).on("click", "#btEnviarEmailRecuperacaoConta", function() {
		$.ajax({
			url: URL_ENVIAR_EMAIL_RECUPERACAO_CONTA,
			data: $("#frmEnviarEmailRecuperacaoConta :input").serialize(),
			success: function(data) {
				$("#conteudo").html(data);
			}
		});
	});
	
	$(document).on("click", "#btLogin", function() {
		obterAbaAtual(function(url) {
			var data = $("#frmLogin :input").serialize();
			data += "&";
			data += $.param({"url.urlCompleta": url});
			
			$.ajax({
				url: URL_PROCESSAR_LOGIN,
				data: data,
				success: function(data) {
					$("#conteudo").html(data);
				}
			});
		});
	});
	
	$(document).on("click", "#btInserirComentario", function() {
		obterAbaAtual(function(url) {
			var data = $("#frmInserirComentario :input").serialize();
			data += "&";
			data += $.param({"comentario.url.urlCompleta": url});
			
			$.ajax({
				url: URL_INSERIR_COMENTARIO,
				data: data,
				success: function(data) {
					$("#frmInserirComentario :text").val("");
					obterComentarios();
				}
			});
		});
	});
	
	$(document).on("click", ".btLikeComentario", function() {
		$.ajax({
			url: URL_LIKAR_COMENTARIO,
			data: $(this).closest(".detalhesComentario").find(":input").serialize(),
			success: function(data) {
				obterComentarios();
			}
		});
	});
	
	$(document).on("click", ".btDislikeComentario", function() {
		$.ajax({
			url: URL_DISLIKAR_COMENTARIO,
			data: $(this).closest(".detalhesComentario").find(":input").serialize(),
			success: function(data) {
				obterComentarios();
			}
		});
	});
	
	$(document).on("click", ".btExibirRespostas", function() {
		var btExibirRespostas = $(this);
		var divRespostas = btExibirRespostas.closest(".comentario").find(".respostas");
		
		if (!divRespostas.is(":empty")) {
			divRespostas.empty();
			return;
		}
		
		exibirRespostas($(this).closest(".detalhesComentario"));
	});
	
	$(document).on("click", ".btInserirResposta", function() {
		var btInserirResposta = $(this);
		$.ajax({
			url: URL_INSERIR_RESPOSTA,
			data: btInserirResposta.closest(".frmInserirResposta").find(":input").serialize(),
			success: function(data) {
				btInserirResposta.closest(".respostas").html(data);
			}
		});
	});
	
	$(document).on("click", ".btLikeResposta", function() {
		var divResposta = $(this).closest(".resposta");
		$.ajax({
			url: URL_LIKAR_RESPOSTA,
			data: divResposta.find(":input").serialize(),
			success: function(data) {
				exibirRespostas(divResposta.closest(".comentario").find(".detalhesComentario"));
			}
		});
	});
	
	$(document).on("click", ".btDislikeResposta", function() {
		var divResposta = $(this).closest(".resposta");
		$.ajax({
			url: URL_DISLIKAR_RESPOSTA,
			data: $(this).closest(".resposta").find(":input").serialize(),
			success: function(data) {
				exibirRespostas(divResposta.closest(".comentario").find(".detalhesComentario"));
			}
		});
	});
	
}

/**
 * Exibe as respostas.
 */
function exibirRespostas(divDetalhesComentario) {
	$.ajax({
		url: URL_EXIBIR_RESPOSTAS,
		data: divDetalhesComentario.find(":input").serialize(),
		success: function(data) {
			$(".respostas").empty();
			divDetalhesComentario.closest(".comentario").find(".respostas").html(data);
		}
	});
}

/**
 * Obtém os comentários.
 */
function obterComentarios() {
	obterAbaAtual(function(url) {
		$.ajax({
			url: URL_OBTER_COMENTARIOS,
			data: {"url.urlCompleta": url},
			success: function(data) {
				$("#conteudo").html(data);
			}
		})
	});
}

/**
 * Obtém a aba atual.
 * Este método é assíncrono.
 * @param callback Função callback
 */
function obterAbaAtual(callback) {
	chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
		var tab = tabs[0];
		callback(tab.url);
	});
}


/**
 * Exibe os erros de negócio.
 * @param html HTML
 */
function exibirErrosNegocio(html) {
	var temErro = $(html).hasClass("erro");
	if(temErro) {
		$("#erros").html(html);
	}
}