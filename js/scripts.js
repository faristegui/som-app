var ubicaciones = [];
var token = "";
var codigoInmo = "";
var paginaResultado = 1;
var ordenResultado = 1;
var oferta;

function mensaje(mensaje)
{
    M.toast({html: mensaje});
}

function obtenerParametros(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function cargarFicha(idOferta)
{
    mensaje('Cargando...');

    var contenido = "";

    var request = new XMLHttpRequest();

    document.getElementById('emailFicha').value = "";

    var url = 'http://sgi.som.com.ar/api/movil/inmueble.php?IdInmueble=' + idOferta + "&token=" + token;
    var cod = $('#codigoBuscar').val();
    if(cod != "")
    {
      cod = cod.replace(/\s/g, '')
      url = 'http://sgi.som.com.ar/api/movil/inmueble.php?codigo=' + cod + "&token=" + token;
    }

    request.open('GET', url, true);
    request.onload = function() {
      var data = JSON.parse(this.response);

      if (request.status < 200){
        mensaje("Ha ocurrido un error. Intente nuevamente.");
      }

      data.forEach(ofer => {

        oferta = ofer;
        $("#contenidoFicha").removeClass("hide");

      });

      $(document).ready(function(){

        var atribs = "";
        var sups = "";
        var ambs = "";

        contenido = "<div class='col s12'>";

        if(oferta.fotos.length > 0)
        {
          contenido = contenido + "<div class='fullwidth'><img class='fullwidth margen' src='" + oferta.fotos[0].url + "'></div>";;
        }

        contenido += "<h5 class='centrado blue-text'><i class='material-icons iconoresultado'>home</i>" + oferta.TipoPropiedad.Nombre + ", " + oferta.SubtipoPropiedad.Nombre + "</h5>";

        contenido += "<h5 class='red-text centrado'>" + oferta.Operacion.Nombre + ": " + oferta.Moneda.Nombre + " " + oferta.importe + "</h5>";

        contenido += "<h5 class='centrado blue-grey-text'>Estado: " + oferta.EstadoOferta.Nombre + "</h5>";

        contenido += "<h5 class='centrado'><i class='material-icons iconoresultado'>place</i>" + armarDireccion(oferta) + "</h5>";

        contenido += "<h6 class='centrado'>" + armarUbicacion(oferta).replace("CIUDAD AUTONOMA BUENOS AIRES","C.A.B.A.") + "</h6>";

        contenido += "<br><div class='destacable margen'><h6>" + oferta.informacionDestacable + "</h6></div>";

        contenido += "</div>";

        document.getElementById('mostrarFicha').innerHTML = contenido;        

        document.getElementById('mapa').innerHTML = "<iframe src='http://sistema.som.com.ar/mapaapp.html?latitud=" + oferta.latitud + "&longitud=" + oferta.longitud + "' frameborder='0' style='border:0'; height='400' class='fullwidth'></iframe>"

        for (key in oferta.atributos) {
          if (oferta.atributos.hasOwnProperty(key)) {
              
          atribs = atribs + "<li><i class='material-icons blue-grey-text iconos-atributos'>keyboard_arrow_right</i>" + key + ": " + oferta.atributos[key] + "</li>";
          }
      }
      if(Object.keys(oferta.atributos).length > 0)
      {
        document.getElementById('atributos').innerHTML = "<h6 class='blue-text'>Atributos: </h6><ul class='atributos'>" + atribs + "</ul>";
      }

      for (key in oferta.superficies) {
          if (oferta.superficies.hasOwnProperty(key)) {
              
          sups = sups + "<li><i class='material-icons blue-grey-text iconos-atributos'>keyboard_arrow_right</i>" + key + ": " + oferta.superficies[key] + "</li>";
          }
      }
      if(Object.keys(oferta.superficies).length > 0)
      {
        document.getElementById('superficies').innerHTML = "<h6 class='blue-text'>Superficies: </h6><ul class='atributos'>" + sups + "</ul>";
      }

      for (key in oferta.ambientes) {
          if (oferta.ambientes.hasOwnProperty(key)) {
              
          ambs = ambs + "<li><i class='material-icons blue-grey-text iconos-atributos'>keyboard_arrow_right</i>" + key + ": " + oferta.ambientes[key] + "</li>";
          }
      }
      if(Object.keys(oferta.ambientes).length > 0)
      {
        document.getElementById('ambientes').innerHTML = "<h6 class='blue-text'>Ambientes: </h6><ul class='atributos'>" + ambs + "</ul>";
      }

      var inmo = codigoInmo.substr(0, 3);
      var suc = codigoInmo.substr(3, 2);

      var url = "http%3A//sgi.som.com.ar/som/verficha.html?" + inmo + "-" + suc + "-" + oferta.codigo;
      var contacto = "<a class='btn blue-grey fullwidth whatsapp' href='whatsapp://send?text=" + url + "' data-action='share/whatsapp/share'>" +
	"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Compartir</a>" +
          "<a class='blue btn fullwidth share modal-trigger' href='#escribirEmail'><i class='material-icons left'>mail</i>Email</a>" +
          "<a class='btn red fullwidth share' href='javascript:verContacto(" + oferta.IdSucursal + ")'><i class='material-icons left'>person</i>Contacto</a>";

      document.getElementById('btnEnviarFicha').innerHTML = "<a class='col s12 btn blue-grey' href='javascript:enviarFicha(" + idOferta + ")'><i class='material-icons right'>send</i>Enviar</a>";

      document.getElementById('compartir').innerHTML = contacto;

      });
 	    $(".tabs").tabs("select", "ficha");
    }
    request.send();
}

function enviarFicha(idOferta)
{
  mensaje("Enviando ficha, aguarde un intante...");
  var clave = sessionStorage.getItem('tokenSOM');
  var user = sessionStorage.getItem('userSOM');
  var msj = "";
  var destinatario = document.getElementById('emailFicha').value;
  var request = new XMLHttpRequest();

  var url = "http://sgi.som.com.ar/api/enviarficha.php?usuario=" + user + "&clave=" + clave + "&IdInmueble=" + idOferta + "&destinatario='" + destinatario + "'";

  request.open('GET', url, true);

    request.onload = function() {
    var data = JSON.parse(this.response);

      if (request.status >= 200 && request.readyState == 4) {
        if(data["Estado"])
        {
          msj = data["Mensaje"];
        }
      }
      else
      {
        msj = "Ha ocurrido un error. Intente nuevamente.";
      }
      mensaje(msj);
    }
    $('#escribirEmail').modal('close');
    request.send();
}

function verContacto(idContacto)
{
	$("#contenidoContacto").empty();
	var request = new XMLHttpRequest();

	var contenido = "<h5 class='centrado'><i class='material-icons'>person</i>&nbsp;Datos de contacto</h5>";

	request.open('GET', 'http://sgi.som.com.ar/api/inmobiliaria.php?idInmobiliaria=' + idContacto, true);

    request.onload = function() {
  	var data = JSON.parse(this.response);

      if (request.status < 200) {
        mensaje("Ha ocurrido un error. Intente nuevamente.");
      }

      //contenido = contenido + "<div class='col s12 centrado'><br>C&oacute;digo: <b>" + data['Inmobiliaria'].Codigo + data['Inmobiliaria'].Sucursal + "</b><h6><b>";
      contenido = contenido + "<div class='col s12 centrado'><b>" + data['Inmobiliaria'].Nombre + "</b></h6></div><div class='col s12 centrado'>";

      if(data['Inmobiliaria'].HorarioAtencion != null && data['Inmobiliaria'].HorarioAtencion != "")
		  {
	    	contenido = contenido + "<br><br>Horario de atenci&oacute;n:" + data['Inmobiliaria'].HorarioAtencion;
	    }

	    if(data['Inmobiliaria'].Responsable != null && data['Inmobiliaria'].Responsable != "")
		  {		
	    	contenido = contenido + "<br><br>Responsable ante el CISA: " + data['Inmobiliaria'].Responsable;
	    }

      if(data['Telefonos'].length > 0)
		  {
			  contenido = contenido + "<br><br>Tel&eacute;fono: " + data['Telefonos'][0] + "<br><br><a href='tel:" + data['Telefonos'][0] + "' class='btn blue' style='width:140px'><i class='material-icons right'>phone</i>llamar</a>";
	    }

      for (var i = 0; i < data['TelefonosConTipo'].length; i++) {
        if(data['TelefonosConTipo'][i].Tipo == "WhatsApp")
        {
          var tel = data['TelefonosConTipo'][i].CodigoPais + " " + data['TelefonosConTipo'][i].CodigoArea + " " + data['TelefonosConTipo'][i].Numero;
          //contenido += "<br><br><a target='_blank' class='btn blue-grey botones whatsapp' style='text-align: right; width:140px' href='https://api.whatsapp.com/send?phone=" + tel + "&text=Contacto por la ficha " + oferta.codigo + "'>Contactar</a>";
          var tel = data['TelefonosConTipo'][i].CodigoPais + " " + data['TelefonosConTipo'][i].CodigoArea + " " + data['TelefonosConTipo'][i].Numero;
          contenido += "<br><br><a class='btn blue-grey fullwidth whatsapp' style='text-align: right; width:140px' href='whatsapp://send?phone=" + tel + "&text=Contacto por la ficha " + oferta.codigo +
          "' data-action='share/whatsapp/share'>Contactar</a>";
          break;
        }
      }

	    if(data['Emails'].length > 0)
		  {
			  contenido = contenido + "<br><br>Email: <a href='mailto:" + data['Emails'][0] + "'>" + data['Emails'][0] + "</a>";
	    }

      contenido = contenido + "</div>";

      $("#contenidoContacto").append(contenido);
    }
    
    request.send();

	$('#contacto').modal('open');
}

function armarDireccion(oferta)
{
  var direccion = "";

  if(oferta.calle != "")
  {
    direccion += oferta.calle;
  }

  if(oferta.altura != "")
  {
    direccion += " " + oferta.altura;
  }

  if(oferta.piso != "")
  {
    direccion += ", " + oferta.piso;
  }

  if(oferta.departamento != "")
  {
    direccion += " " + oferta.departamento;
  }

  if(oferta.entreCalles != "")
  {
    direccion += " (" + oferta.entreCalles + ")";
  }

  if(oferta.referencia != "")
  {
    direccion += " " + oferta.referencia;
  }

  if(oferta.lote != "")
  {
    direccion += "Lote " + oferta.lote;
  }

  if(oferta.ruta != "")
  {
    direccion += "Ruta " + oferta.ruta;
  }

  if(oferta.km != "")
  {
    direccion += "Km " + oferta.km;
  }

  if(oferta.manzana != "")
  {
    direccion += "Manzana " + oferta.manzana;
  }

  if(oferta.parcela != "")
  {
    direccion += "Parcela " + oferta.parcela;
  }


  return direccion;
}

function armarUbicacion(oferta)
{
  var ubicacion = "";

  /*if(oferta.Pais.Id != null)
  {
    ubicacion += oferta.Pais.Nombre;
  }*/

  if(oferta.Barrio.Id != null)
  {
    ubicacion += oferta.Barrio.Nombre + ", ";
  }

  if(oferta.Zona.Id != null)
  {
    ubicacion += oferta.Zona.Nombre + ", ";
  }

  if(oferta.BarrioCerrado.Id != null)
  {
    ubicacion += oferta.BarrioCerrado.Nombre + ", ";
  }

  if(oferta.Localidad.Id != null && oferta.Localidad.Nombre != "CAPITAL FEDERAL")
  {
    ubicacion += oferta.Localidad.Nombre + ", ";
  }

  if(oferta.Partido.Id != null && oferta.Partido.Nombre != "CAPITAL FEDERAL")
  {
    ubicacion += oferta.Partido.Nombre + ", ";
  }

  if(oferta.Provincia.Id != null && oferta.Provincia.Nombre != "CAPITAL FEDERAL")
  {
    ubicacion += oferta.Provincia.Nombre;
  }

  var caracter = ubicacion.substring(ubicacion.length - 2, ubicacion.length);

  if(caracter.includes(","))
  {
      ubicacion = ubicacion.substring(0,ubicacion.length -2);
  }

  return ubicacion;
}

function cargarBusqueda()
{
  var cod = $('#codigoBuscar').val();

  if(cod != "")
  {
    cargarFicha(0);
    $('#codigoBuscar').val('');    
  }
  else
  {
    paginaResultado = 1;
    cargarResultado(paginaResultado,15,ordenResultado);
    $("#cargarMasResultados").removeClass("hide");
  }
}

function cargarMasResultados()
{
  paginaResultado += 1;
  cargarResultado(paginaResultado,15,ordenResultado);
}


function enviarOferta()
{
  mensaje("Grabando, un momento por favor...");
}

function cargarResultado(pagina, cantidad, idOrden)
{
  mensaje('Buscando, un momento por favor...');
  var ofertas = "";
  var misOfertas = 0;
  var request = new XMLHttpRequest();

  if(pagina == 1)
  {
    document.getElementById('itemsResultados').innerHTML = "";
  }

  var producto = document.getElementById('producto').value;
  var provincia = document.getElementById('provincia').value;

  var subproducto = document.getElementById('subproducto').value;
  var operacion = document.getElementById('operacion').value;

  var codigo = document.getElementById('codigoBuscar').value;

  var ubic = $('#ubicacionBuscar').val();
  var parametroUbicacion = "";

    if(ubic != "")
    {
      var valor = ubicaciones.find(item => item.nombre === $('#ubicacionBuscar').val());

      parametroUbicacion = "&" + valor.parametro + "=" + valor.id;
    }
    if(provincia != "")
    {
      parametroUbicacion += "&IdProvincia=" + $('#provincia').val();
    }

    if($('#soloMisOfertas').prop('checked'))
    {
      misOfertas = 1;
    }
    
    $("#contenidoFicha").addClass("hide");

    if(operacion != "")
    {
      operacion = '&IdOperacion=' + operacion;
    }

    var url = 'http://sgi.som.com.ar/api/movil/buscarinmuebles.php?pagina=' + pagina + '&cantidad=' +
            cantidad  + '&IdOperacion=' + operacion + parametroUbicacion + "&token=" + token + "&misOfertas=" + misOfertas + "&idOrden=" + idOrden;

    if(producto != "")
    {
      url += "&IdTipoPropiedad=" + producto;
    }

    if(subproducto != "")
    {
      url += "&IdSubtipoPropiedad=" + subproducto;
    }

    if(codigo != "")
    {
      url += "&codigo=" + codigo;
    }

      request.open('GET', url, true);
      
      request.onload = function() {
      var data = JSON.parse(this.response);

        if (request.status < 200) {
          mensaje("Ha ocurrido un error. Intente nuevamente.");
        }

          data.forEach(oferta => {

            if(oferta.totales.Total == 0)
            {
              ofertas = "<h4 class='centrado'>No se encontraron resultados.<br><br><i class='material-icons large red-text'>thumb_down</i></h4>";
              $("#cargarMasResultados").addClass("hide");
            }
            else
            {
              oferta.inmuebles.forEach(inmueble => {

                var foto = "";

                if(inmueble.Foto != "" && inmueble.Foto != null)
                {
                  foto = "<img class='fotolistado' src='" + inmueble.Foto + "' height='50'>";
                }
                else
                {
                  foto = "<img class='fotolistado' src='images/noimage80.jpg' height='50'>";
                }

                var item = 
                "<table width='100%' class='listado' onclick='cargarFicha(" + inmueble.IdInmueble + ");' id='tablaResultado'><tr class='itemlistado'>" +
                "       <td width='80'>" + foto + "</td>" +
                "       <td>" + inmueble.TipoPropiedad.replace(" <br>", ",") + "<br>" +
                inmueble.Domicilio + ", " + inmueble.Ubicacion.replace("CIUDAD AUTONOMA BUENOS AIRES", "C.A.B.A.").replace(", Argentina","") + "<br>"
                + inmueble.Precio +
                "</td></tr></table>";
                ofertas = ofertas + item;
              });
            }

          });

          //document.getElementById('itemsResultados').innerHTML = ofertas;
        $('#itemsResultados').append(ofertas);
        $(".tabs").tabs("select", "resultado");
      }

      request.send();
}

function setearDomicilios(cambioProv)
{

  var id = 0;

  if(cambioProv)
  {
    id = $('#provincia').val();
    $('#ubicacionBuscar').val('')
  }
  else
  {
    if(oferta != null)
    {
      id = oferta.Provincia.Id;
    }
  }

  if(id == 11)
  {
    $("#domicilio").addClass("hide");
  }
  else
  {
    $("#domicilio").removeClass("hide");
  }
}

function inicializar()
{
    setTimeout(function() {
      $(document).ready(function(){
        $('.tabs').tabs();
        $('select').formSelect();
        $('.modal').modal();
        $('.sidenav').sidenav();
        $('.collapsible').collapsible();
      });

      $('#ubicacionBuscar').val('');

      token = obtenerParametros('token');
      codigoInmo = obtenerParametros('inmobiliaria');

      if(!token)
      {
        mensaje("No se ha ingresado un Token. Es necesario para operar.");
      }

      cargarProductos();
      cargarSubproductos();
      inicializarPaises();
      inicializarProvincias(1);

      $('#tipoInv').on('change', function() {
        cargarInventario();
      });

      $('#busquedaSom').removeClass('hide');

    }, 200);
}

function cargarProductos()
{
  var request = new XMLHttpRequest();

  request.open('GET', 'http://sgi.som.com.ar/api/productos.php', true);

  var Options="";

  $('#producto').empty();

  Options = Options + "<option value='' selected disabled>Seleccionar</option>";

  request.onload = function() {
  var data = JSON.parse(this.response);

    if (request.status < 200) {
      mensaje("Ha ocurrido un error. Intente nuevamente.");
    }

      data[0].TipoProducto.forEach(producto => {
        $.each(data, function(){ 
          Options = Options + "<option value='" + producto.ID + "'>" + producto.Nombre + "</option>";
      });
    });
      $('#producto').append(Options);

    $('#producto').formSelect();
    $('#producto').on('change', function()
    {
      cargarSubproductos();
      if($('#producto').val() == 37)
      {
        $('#lblSup2').text("Hectareas");
      }
    });
  }
  request.send();
}

function ordenarResultados(orden)
{
  ordenResultado = orden;
  cargarResultado(paginaResultado,15,ordenResultado);
}

function cargarSubproductos()
{
  var request = new XMLHttpRequest();

  var idproducto = $('#producto').val();

  request.open('GET', 'http://sgi.som.com.ar/api/subproductos.php?idProducto=' + idproducto, true);

  var Options="";

  $('#subproducto').empty();

    Options = Options + "<option value='' selected>Seleccionar</option>";

    request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status < 200) {
      mensaje("Ha ocurrido un error. Intente nuevamente.");
    }

      data[0].SubtipoProducto.forEach(producto => {
        $.each(data, function(){ 
            Options = Options + "<option value='" + producto.ID + "'>" + producto.Nombre + "</option>";
        });
      });
      $('#subproducto').append(Options);

      $('#subproducto').formSelect();
    }
    
    request.send();
}

function inicializarPaises()
{
  var request = new XMLHttpRequest();

  request.open('GET', 'http://sgi.som.com.ar/api/paises.php', true);

  var Options="";

    request.onload = function() {
      var data = JSON.parse(this.response);

      if (request.status < 200) {
        mensaje("Ha ocurrido un error. Intente nuevamente.");
      }

        data.Paises.forEach(pais => {
            Options = Options + "<option value='" + pais.ID + "'>" + pais.Nombre + "</option>";
        });
        $('#pais').append(Options);

        $('#pais').formSelect();
        $('#pais').on('change', function() {
        inicializarProvincias(this.value);
      });
    }
    
    request.send();
    $('#pais').val('1');
}


function cargarInventario()
{
  mensaje("Cargando...");

  document.getElementById('contenidoInventario').innerHTML = "";

  var ofertas = "";

  var tipo = $('#tipoInv').val();

  document.getElementById('contenidoInventario').innerHTML = "";

  var request = new XMLHttpRequest();

  var url = 'http://sgi.som.com.ar/api/movil/inventario.php?visible=' + tipo + '&token=' + token;

  request.open('GET', url, true);

  request.onload = function() {
    var data = JSON.parse(this.response);

      if (request.status < 200) {
        mensaje("Ha ocurrido un error. Intente nuevamente.");
      }

      if(!data["Error"])
      {
        data[0].forEach(oferta => {
          
          var foto = "images/noimage80.jpg";

          if(oferta.Foto !== "")
          {
            foto = oferta.Foto;
          }

          var vence = "";
          if(oferta.Vencimiento.includes("Vencida"))
          {
            vence = "grey-text";
          }
          if(oferta.Vencimiento.includes("vencer"))
          {
            vence = "red-text";
          }

          var direccion = "";

          if(oferta.Localidad != "")
          {
            direccion = oferta.Direccion + ", " + oferta.Localidad;
          }
          if(oferta.Barrio != "")
          {
            direccion = oferta.Direccion + ", " + oferta.Barrio;
          }

          var item = 
          "    <tr class='itemlistado " + vence + "'>" +
          "       <td onclick='editarFicha(" + oferta.id + ");'><img src='" + foto + "' height='50'></td>" +
          "       <td onclick='editarFicha(" + oferta.id + ");'>" + oferta.Codigo + " | " + oferta.Producto + "<br>" + direccion + "<br>" + oferta.Operacion + " "
          + oferta.Moneda + " " + oferta.Importe +
          "</td></tr>";
          ofertas = ofertas + item;
        });
      }
      else
      {
        mensaje(data["Error"]);
      }

      $('.tooltipped').tooltip();
      document.getElementById('contenidoInventario').innerHTML = "<table width='100%' class='listado' id='tablaInventario'>" + ofertas + "</table>";
      $('#inventarioSom').removeClass("hide");
    }
    
    request.send();
}

function editarFicha(idOferta)
{
  $('#tablaInventario tr').click(function(e) {
      $('#tablaInventario tr').removeClass('blue-grey');
      $('#tablaInventario tr').removeClass('lighten-4');
      $(this).toggleClass('blue-grey');
      $(this).toggleClass('lighten-4');
  });

  limpiarFormulario();

  document.getElementById('mapaABM').style.display = 'none';

  $("#itemsFotos").empty();
  $("#itemsPlanos").empty();
  
  $(".tabs").tabs("select", "editar");

  mensaje("Un momento por favor...");

  var request = new XMLHttpRequest();

  var url = 'http://sgi.som.com.ar/api/movil/inmueble.php?IdInmueble=' + idOferta + "&token=" + token;

  request.open('GET', url, true);

    request.onload = function() {
      var data = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {
        data.forEach(ofer => {

          oferta = ofer;

        });
      }

      $('#producto').val(parseInt(oferta.TipoPropiedad.Id));
      cargarSubproductos('producto', 'subproducto');
      $('#precio').val(oferta.importe);

      $('#calle').val(oferta.calle);

      $('#codigo').text(oferta.codigo);

      $('#altura').val(oferta.altura);

      $('#piso').val(oferta.piso);

      $('#departamento').val(oferta.departamento);

      $('#ruta').val(oferta.ruta);
      $('#km').val(oferta.km);
      $('#referencia').val(oferta.referencia);

      $('#destacable').val(oferta.informacionDestacable);
      M.updateTextFields();
      M.textareaAutoResize($('#destacable'));

      $('#operacion').val(parseInt(oferta.Operacion.Id));
      $('#invMoneda').val(parseInt(oferta.Moneda.Id));

      $('#pais').val(parseInt(oferta.Pais.Id));

      inicializarProvincias(oferta.Pais.Id);

      // Superficies
      $('#txtSup1').addClass("hide");
      $('#txtSup2').addClass("hide");
      $('#lblSup1').text("");
      $('#lblSup2').text("");
      var count = 1;
      for (key in oferta.superficies) {
        if(count <= 2)
        {
          if (oferta.superficies.hasOwnProperty(key)) {
            $('#txtSup' + count).removeClass("hide");
            var sup = key.replace("Superficie","Sup.");
            sup = sup.replace("cubierta", "cub.");
            $('#lblSup' + count).text(sup);
            $('#txtSup' + count).val(oferta.superficies[key]);
            count += 1;
          }
        }
      }
      if(count == 1)
      {
        $('#txtSup1').removeClass("hide");
        $('#txtSup2').removeClass("hide");
        $('#lblSup1').text("Sup. cubierta");
        $('#lblSup2').text("Sup. total");
        if($('#producto').val() == 37)
        {
          $('#lblSup2').text("Hectareas");
        }
      }

      setTimeout(function(){
        $('#provincia').val(parseInt(oferta.Provincia.Id));
        $('#subproducto').val(parseInt(oferta.SubtipoPropiedad.Id));
        $('select').formSelect();
      }, 1000);

      inicializarUbicaciones(oferta.Pais.Id, oferta.Provincia.Id);

      var nombreUbicacion = filtrarCABA(oferta.Localidad.Nombre);

      if(oferta.Barrio.Nombre !== "")
      {
        nombreUbicacion += ", " + oferta.Barrio.Nombre;
      }

      if(oferta.Zona.Nombre !== "")
      {
        nombreUbicacion += ", " + oferta.Zona.Nombre;
      }

      if(oferta.BarrioCerrado.Nombre !== "")
      {
        nombreUbicacion += ", " + oferta.BarrioCerrado.Nombre;
      }

      $('#ubicacionBuscar').val(nombreUbicacion);

      if(oferta.mostrarPrecioEnPortales == "1")
      {
        $("#precioPortales").prop("checked", true);
      }
      else
      {
        $("#precioPortales").prop("checked", false);
      }

      if(oferta.visibleEnSistema == "1")
      {
        $("#publicarSom").prop("checked", true);
      }
      else
      {
        $("#publicarSom").prop("checked", false);
      }

      if(oferta.latitud != "" || oferta.longitud != "")
      {
        ubicarMapa(oferta.latitud, oferta.longitud);
      }

      oferta.fotos.forEach(fot => {
        $("#itemsFotos").append("<li class='list'><img class='full fotoInventario' src='" + fot.url + "' width='100'><a class='btn-remove btn red'>X</a></li>");
      });

      oferta.planos.forEach(pla => {
        $("#itemsPlanos").append("<li class='list'><img class='full planoInventario' src='" + pla.url + "' width='100'><a class='btn-remove btn red'>X</a></li>");
      });

      setearDomicilios(false);
    }
    request.send();
}

function ubicarMapa(lat, long)
{
  $('#invMapa').attr('src', 'http://sistema.som.com.ar/mapaapp.html?latitud=' + lat + '&longitud=' + long);
  $('#latitud').val(lat);
  $('#longitud').val(long);
  document.getElementById('mapaABM').style.display = 'block';
}

function filtrarCABA(nombre)
{
  if(nombre === "CIUDAD AUTONOMA BUENOS AIRES")
  {
    return "C.A.B.A.";
  }
  else return nombre;
}

function inicializarEditorImagenes()
{
  $(function () {
  $("#itemsFotos").sortable({
          start: function (event, ui) {
                  ui.item.toggleClass("highlight");
          },
          stop: function (event, ui) {
                  ui.item.toggleClass("highlight");
          }
  });
  $("#itemsFotos").disableSelection();
  });

  $(document).ready(function() { 
    $('#itemsFotos').on('click', '.btn-remove', function(){
      $(this).closest('li').fadeOut('slow', function(){
        $(this).remove();
      });
    });
  });

  $(function () {
  $("#itemsPlanos").sortable({
          start: function (event, ui) {
                  ui.item.toggleClass("highlight");
          },
          stop: function (event, ui) {
                  ui.item.toggleClass("highlight");
          }
  });
  $("#itemsPlanos").disableSelection();
  });

  $(document).ready(function() { 
    $('#itemsPlanos').on('click', '.btn-remove', function(){
      $(this).closest('li').fadeOut('slow', function(){
        $(this).remove();
      });
    });
  });
}

function cargarFotos() {

  mensaje('Cargando imagenes, aguarde un instante...');

    var files = $('#subirFotos')[0].files;

    var xhr = new XMLHttpRequest();

    var jsonFotos = {};

    var posFoto = 0;

    var url = 'http://sgi.som.com.ar/api/subirfotos.php';

  for (var i = 0, f; f = files[i]; i++) {

      var reader = new FileReader();

      reader.onload = function (e) {

        jsonFotos[posFoto] = e.target.result;

        posFoto++;
      };
      reader.readAsDataURL(f);
  }

  setTimeout(function() {

    var data = JSON.stringify(jsonFotos);
  
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            for (var j = 0; j < json.urls.length; j++) {
              $("#itemsFotos").append("<li class='list'><img class='full fotoInventario' src='" + json.urls[j] + "' width='100'><a class='btn-remove btn red'>X</a></li>");
            }
        }
    };

    xhr.send(data);

  }, 1500);
}

function cargarPlanos() {

  mensaje('Cargando imagenes, aguarde un instante...');

    var files = $('#subirPlanos')[0].files;

    var xhr = new XMLHttpRequest();

    var jsonPlanos = {};

    var posPlano = 0;

    var url = 'http://sgi.som.com.ar/api/subirfotos.php';

  for (var i = 0, f; f = files[i]; i++) {

      var reader = new FileReader();

      reader.onload = function (e) {

        jsonPlanos[posPlano] = e.target.result;

        posPlano++;
      };
      reader.readAsDataURL(f);
  }

  setTimeout(function() {

    var data = JSON.stringify(jsonPlanos);
  
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            for (var j = 0; j < json.urls.length; j++) {
              $("#itemsPlanos").append("<li class='list'><img class='full planoInventario' src='" + json.urls[j] + "' width='100'><a class='btn-remove'>Borrar</a></li>");
            }
        }
    };

    xhr.send(data);

  }, 1500);
}

function altaOferta()
{
  limpiarFormulario();
  inicializarPaises();
  inicializarProvincias(1);
  $("#domicilio").removeClass("hide");
  $(".tabs").tabs("select", "editar");
}

function limpiarFormulario() {

  oferta = null;
  $('#editar').find('input:text').val('');
  $('.select').val(0);
  $('#destacable').val('');
  $('#precio').val('');
  $('#calle').val('');
  $('#altura').val('');
  $('#supTotal').val('');
  $('#supCubierta').val('');
  $('#txtSup1').removeClass("hide");
  $('#txtSup2').removeClass("hide");
  $('#lblSup1').text("Sup. cubierta");
  $('#lblSup2').text("Sup. total");
  inicializarPaises();
  $("#destacable").height(50);
  document.getElementById('itemsFotos').innerHTML = "";
  document.getElementById('itemsPlanos').innerHTML = "";
  $('#invMapa').attr('src', '');
  cerrarMapa();
  $('#publicarSom').prop("checked", true);
  $('#precioPortales').prop("checked", true);

  setTimeout(function(){
    $('select').formSelect();
  }, 1000);
}

function cerrarMapa()
{
  document.getElementById('mapaABM').style.display = 'none';  
}

function georeferenciar()
{
  mensaje('Ubicando en mapa, aguarde un instante...');

  var provincia = $("#provincia option:selected").text();

  var ubicacion = $('#ubicacionBuscar').val();

  var calle = $('#calle').val();

  var altura = $('#altura').val();

  var provincia = $("#provincia option:selected").text();

  var ubicacion = $('#ubicacionBuscar').val().split(',')[0];

  var urlApi = "https://maps.googleapis.com/maps/api/geocode/json?address=" + provincia + ", " + ubicacion + ", " + calle + ", " + altura + "&key=AIzaSyBGtClDdDlC_-ITTM_JXTw5JiFJgyN_ehY";

  var request = new XMLHttpRequest();

  request.open('GET', urlApi, true);

    request.onload = function() {
    var data = JSON.parse(this.response);

    if (request.status < 200) {
      mensaje("Ha ocurrido un error. Intente nuevamente.");
    }
    
      if(data.results.length > 0)
      {
        var lat = parseFloat(data.results[data.results.length -1].geometry.location.lat);
        var long = parseFloat(data.results[data.results.length -1].geometry.location.lng);

        $('#latitud').val(lat);
        $('#longitud').val(long);

        ubicarMapa(lat,long);
      }
      else
      {
        cerrarMapa();
        mensaje('No se ha podido ubicar en el mapa...');
      }
    }
    
    request.send();
}

function ubicarMapa(lat, long)
{
  $('#invMapa').attr('src', 'http://sistema.som.com.ar/mapaapp.html?latitud=' + lat + '&longitud=' + long);
  $('#latitud').val(lat);
  $('#longitud').val(long);
  document.getElementById('mapaABM').style.display = 'block';
}

function inicializarProvincias(idPais)
{
  $("#provincia").empty();

  var request = new XMLHttpRequest();

  request.open('GET', 'http://sgi.som.com.ar/api/provincias.php?idPais=' + idPais, true);

  var Options="";
  Options = Options + "<option value='' selected disabled>Seleccionar</option>";
    request.onload = function() {
      var data = JSON.parse(this.response);

      if (request.status < 200) {
        mensaje("Ha ocurrido un error. Intente nuevamente.");
      }

        data.Provincias.forEach(prov => {
            Options = Options + "<option value='" + prov.ID + "'>" + prov.Nombre + "</option>";
        });
        $('#provincia').append(Options);

        $('#provincia').formSelect();
        $('#provincia').on('change', function() {
          setearDomicilios(true);
          inicializarUbicaciones(idPais, this.value);
        });
    }
    
    request.send();
}

function inicializarUbicaciones(idPais, idProvincia)
{
  var request = new XMLHttpRequest();

  request.open('GET', 'http://sgi.som.com.ar/api/ubicacionesMovil.php?idPais=' + idPais + '&idProvincia=' + idProvincia, true);

    request.onload = function() {
      var data = JSON.parse(this.response);

    var dataUbicaciones = {};

    if (request.status < 200) {
      mensaje("Ha ocurrido un error. Intente nuevamente.");
    }

    data.forEach(ubi => {
      dataUbicaciones[ubi.nombre] = null;
      ubicaciones.push({nombre: ubi.nombre, parametro: ubi.parametro, id: ubi.id});
    });

    $('#ubicacionBuscar').autocomplete({
      data: dataUbicaciones,
      function (a, b, inputString) {
          return a.indexOf(inputString) - b.indexOf(inputString);
      }    
    });
    }
    
    request.send();
}

function verBusqueda()
{
  if(token != "" && codigoInmo != "")
  {
    window.location.href = "busqueda.html?token=" + token + "&inmobiliaria=" + codigoInmo;
  }
  else
  {
    mensaje("Atención! Su sesión ha expirado.");
    window.location.href = "index.html";
  }
}

function verInventario()
{
  if(token != "")
  {
    window.location.href = "inventario.html?token=" + token + "&inmobiliaria=" + codigoInmo;
  }
  else
  {
    alert("Atención! Su sesion ha expirado.");
    window.location.href = "index.html";
  }
}