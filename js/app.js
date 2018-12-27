//Declaramos variables
var duracionCambioTitulo= 2000;
var colorTitulo1 = "#ffffff";
var colorTitulo2 = "#DCFF0E";
var inicios = 0;
var totalColumnas = 7;
var totalFilas = 7;
var blockUpdate = false;
var tiempoDelJuego = 120;
$(()=>{
	// Realizamos Acciones
	AnimarTitulo(duracionCambioTitulo, colorTitulo1, colorTitulo2);
	// - addListener
	$(".btn-reinicio").click(()=>{
		inicios++;
		$(".btn-reinicio").text("Reiniciar");
		if(inicios==1){
			StartGame();
		}else{
			location.reload();
		}
	})

})

/*******************************************************************************
 * ****************************************************************************\
 * **************************************************** Declaración de Funciones
 ******************************************************************************/
// ---------------------------------------------------------- Cambio de Titulo
function AnimarTitulo(duracionCambioTitulo, colorTitulo1, colorTitulo2) {
	var titulo = $(".main-titulo").animate({color:colorTitulo1}, duracionCambioTitulo,
			function () {
		// intercambiamos los colores
		AnimarTitulo( duracionCambioTitulo,colorTitulo2, colorTitulo1);
	});
}
// --------------------------------------------------------------

// --------------------------------------------------------------- Iniciar Juego
function StartGame(){
	// Creamos las imagenes
	for (var i = 1; i <= totalColumnas; i++) {
		for (var j = 1; j <= totalFilas; j++) {
			CrearElemento(i,j);
		}
	}
	//Iniciamos el Cronometro
	startTimer(tiempoDelJuego);
	// Realizamos el primer update
	setTimeout(UpdateGame,1100);
}

function UpdateGame() {
	var puntosExtra=0;
	for (var i = 1; i <= totalColumnas; i++) {
		for (var j = 1; j <= totalFilas; j++) {
			var result = TieneCoincidencias(i,j);
			if(!result)
				continue;
			$(".col-"+i+" .row-"+j).addClass("eliminar")
			puntosExtra++;
		}
	}
	if(puntosExtra>0){
		blockUpdate = false;
		$(".eliminar").effect("explode",1000,EliminarAndCrear);
		// desactivamos el draggable
		$(".elemento").draggable();
		$(".elemento").droppable();
		$(".elemento").draggable("destroy");
		$(".elemento").droppable("destroy");
	}else{
		// permitimos al usuario "jugar"
		$(".elemento").draggable({
			revert: true,
			stack: ".elemento"
		});
		$(".elemento").droppable({
			accept : ".elemento",
			drop : DropHandler
		})
	}
	ActualizarPuntaje(puntosExtra)
}

function EliminarAndCrear() {
	if(blockUpdate)
		return;
	blockUpdate = true;
	$(".eliminar").remove();
	for (var i = 1; i <= totalColumnas; i++) {
		var childs =  $(`.col-${i}`).children();
		var total = childs.length;
		var dif = totalFilas- total ;
		if(dif>0){
			childs.attr("class",null).addClass("elemento");
			for (var j = 0; j <total; j++) {
				$(childs[j]).addClass("row-"+(total-j))
			}
			for (var j = 1; j <= dif; j++) {
				CrearElemento (i,j+total);
			}
		}
	}
	// otro update
	setTimeout(UpdateGame,1100);
}

// ---------------------------------------------------------------
// --------------------------------------------------------------- Eventos
function startTimer(seconds) {
	// gameOver
	if(seconds<=0){
		$("#timer").text( "00:00");
		$(".panel-tablero, .time").animate({width: "0",height: "0", opacity: "0"},1000)
		$(".panel-score").animate({width: "100%"},1000,function () {
		$(".panel-tablero, .time").remove();
			$(".panel-score").prepend("<h1 class='main-titulo' style='text-align: center'>JUEGO TERMINADO</h1>")
		})
		return;
	}
	m= Math.floor(seconds/60);
	s = seconds%60;
	// add a zero in front of numbers<10
	m = checkTime(m);
	s = checkTime(s);
	$("#timer").text( m + ":" + s);
	setTimeout(function(){
		startTimer(seconds-1)
	}, 1000);
}

function checkTime(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

function DropHandler(event, ui) {
	// actualizamos los movimientos aunque se haya equivocado
	ActualizarMovimientos(1);
	// Comprobamos si es un movimiento valido
	// (a solo 1 unidad de distancia)
	var pos = 0;
	var itRow = $(this).attr("class");
	var hisRow = $(ui.draggable).attr("class");
	pos = itRow.indexOf("row-");
	itRow = itRow.substr(pos+4,1);
	pos = hisRow.indexOf("row-");
	hisRow = hisRow.substr(pos+4,1);
	var difY = Math.abs(itRow-hisRow);
	// ahora el movimiento entre columnas
	var itCol = $(this).parent().attr("class").replace("col-","");
	var hisCol = $(ui.draggable).parent().attr("class").replace("col-","");
	var difX = Math.abs(itCol-hisCol);
	// es movimiento valido si solo se movio una unidad
	if(difX+difY!=1)return;
	// intercambiamos sus posiciones
	var tmp = $("<div>");
	$(this).before(tmp);
	$(ui.draggable).before($(this));
	$(tmp).after($(ui.draggable)).remove();
	$(ui.draggable).draggable("option", "revertDuration", 0 );
	// intercambiamos sus clases row
	$(ui.draggable).removeClass("row-"+hisRow).addClass("row-"+itRow);
	$(this).removeClass("row-"+itRow).addClass("row-"+hisRow);

	// Actualizamos
	setTimeout(UpdateGame,100);
}

// ---------------------------------------------------------------
// --------------------------------------------------------------- Utilidades
function CrearElemento(i,j) {
	var tipo = Math.round( Math.random()*3+1);
	$(".col-"+i).prepend(`<img class='elemento row-${j}' src='image/${tipo}.png'>`);
	var elemento = $(".col-"+i+" .row-"+j);
	AplicarAnimacionDeCaida(elemento,1000,j);
}

function AplicarAnimacionDeCaida(selector,duracion,j) {
	selector
	.css({position: "absolute",top: (-(j-1)*96)+"px"})
	.animate({top: ((9-j)*96-48)+"px"}, duracion, function () {
		$(this).attr("style",null).css({position: "relative"})
	})
}

function TieneCoincidencias(x,y) {
	var tipo = GetTipo(x,y);
	var esperado = tipo+tipo+tipo;
	// hacia arriba
	var tipo1 = GetTipo(x,y-1);
	var	tipo2 = GetTipo(x,y-2);

	if(tipo+tipo1+tipo2==esperado)return true;
	// hacia abajo
	var tipo1 = GetTipo(x,y+1);
	var tipo2 = GetTipo(x,y+2);

	if(tipo+tipo1+tipo2==esperado)return true;
	// hacia la derecha
	var tipo1 =		GetTipo(x+1,y);
	var tipo2 = GetTipo(x+2,y);

	if(tipo+tipo1+tipo2==esperado)return true;
	// hacia la izquierda
	var tipo1 =		GetTipo(x-1,y);
	var tipo2 = GetTipo(x-2,y);

	if(tipo+tipo1+tipo2==esperado)return true;
	// cruz horizonal
	var tipo1 =		GetTipo(x-1,y);
	var tipo2 = GetTipo(x+1,y);

	if(tipo+tipo1+tipo2==esperado)return true;
	// cruz vertical
	var tipo1 =		GetTipo(x,y-1);
	var tipo2 = GetTipo(x,y+1);

	if(tipo+tipo1+tipo2==esperado)return true;
	// no hay coincidencias
	return false;
}
function GetTipo(x,y) {
	var dulce = $(".col-"+x+" .row-"+y);
	if(dulce.length==0)return 0;
	var tipo = dulce.attr("src");
	tipo =tipo.replace("image/","").replace(".png","");
	return tipo;
}
function ActualizarMovimientos(cant) {
	var movimientos = $("#movimientos-text").text();
	movimientos = parseInt(movimientos)+cant;
	$("#movimientos-text").text(movimientos);
}
function ActualizarPuntaje(cant) {
	var movimientos = $("#score-text").text();
	movimientos = parseInt(movimientos)+cant;
	$("#score-text").text(movimientos);
}
// ---------------------------------------------------------------
