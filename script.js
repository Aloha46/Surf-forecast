





//stormGlass Api will return wave height and water temps for provided lat and long
const CastUrl = "https://api.stormglass.io/forecast";
const key = "06b36a2c-6295-11e8-8b92-0242ac120008-06b36bda-6295-11e8-8b92-0242ac120008";
function callStormGlassApi(long, lat, Loc) {
//console.log(long, lat)
	$.ajax({
    url: CastUrl,
    data: {
    	lat: lat,
    	lng: long

    },
     headers: {
      'Authentication-Token': key  
    },

    dataType: 'json',
    type: 'GET',
    success: function(data) { 
    	//in renderPage, 'Loc' is passed through to provide name of city when rendered
    	renderPage(data, Loc);
    },
    error: renderError
    })
    	
    }
    
function getProp(object, keys, defaultVal = null) {
  keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return getProp(object, keys.slice(1), defaultVal);
  }
  return object === undefined ? defaultVal : object;
}

function renderPage(data, Loc) {
	//getProp function determines if value returned is null (error)
    const height = getProp(data, 'hours[0].waveHeight[2].value')
    
    const water = getProp(data, 'hours[0].waterTemperature[2].value');
    console.log(data);
    if(height && water) {
  	$('.output-heading').html(`<h2>Today\'s conditions for ${Loc}:</h2>`);
	$('.output').html(`<div>Wave Height: ${height} meters  <button class="buttonOut" data-measure="${height}" data-unitsm="m">Meters/Feet</button></div>`);
	$('.waterTemp').html(`<div>Water temp: ${water} celcius  <button class="buttonW" data-temp="${water}" data-units="c">Celcius/Fahrenheit</button></div>`);
    } else {
    	renderError()
    }
	
	
}
 //GoogleApi translates Loc into Lat and Long coordinates
function callGoogleApi(Loc) {
	$.ajax({
  	url: 'https://maps.googleapis.com/maps/api/geocode/json',
  	data: {
  		key: 'AIzaSyBqCNU_iZ01XaLo3EdWRupVSr_jLhEfNqA',
  		address: Loc
  	},
    success: function(data) {
    	//console.log(data)
    	const long = data.results[0].geometry.location.lng;
    	const lat = data.results[0].geometry.location.lat;
    	callStormGlassApi(long, lat, Loc);
    },
    error: renderError
  })
}
function renderError() {
	$('.output').html('<h2 class="error">No info on that location, try another one.</h2>')
}

function convert(temp, units) {
	//logic to convert temp from Celcius to Fahrenheit
	
	if(units === "c") {
		const output = Number(temp) * 9 / 5 + 32; 

        const rounded = Math.round(output * 100) / 100
		$('.waterTemp').html(`<div>Water temp: ${rounded} fahrenheit  <button class="buttonW" data-temp="${rounded}" data-units="f">C/F</button></div>`);
	}
	//logic to convert from fahrenheit to Celcius
	else {
		
		const output = (Number(temp)-32) / 1.8
		const rounded = Math.round(output * 100) / 100
		$('.waterTemp').html(`<div>Water temp: ${rounded} celcius  <button class="buttonW" data-temp="${rounded}" data-units="c">C/F</button></div>`);
	}
}
 function LengthConverter(height, measure) {
  //upon button click, convert from meters to feet
  if(measure === "m") {
  	const output = Number(height) *3.2808;
  	//below makes decimal to second place
  	const rounded = Math.round(output * 100) / 100
  	//console.log(output)
  	$('.output').html(`<div>Wave Height: ${rounded} feet  <button class="buttonOut" data-measure="${rounded}" data-unitsm="f">M/F</button></div>`);
  }
  //feet to meters
  else {
    
  	const output = (Number(height) * 0.3048);
  	//below makes decimal to second place
  	const rounded = Math.round(output * 100) / 100;
  	$('.output').html(`<div>Wave Height: ${rounded} meters  <button class="buttonOut" data-measure="${rounded}" data-unitsm="m">M/F</button></div>`);
  }
}


function watchSubmit() {
	//capture search box value (city) upon submission and send to googleApi to get city longitude and latitude
	$('.js-search-form').submit(function(event) {
		event.preventDefault();
		const queryTarget = $('.js-query');
		const query = queryTarget.val();
		queryTarget.val("");
		callGoogleApi(query);
		
	});
	//flip water temps to Fahrenheit\Celcius
	$('.waterTemp').on('click', '.buttonW', function(event) {
		const temp = $(this).attr('data-temp');
		const units = $(this).attr('data-units');
		//console.log(temp, units)
		convert(temp, units);
		});
	//Flip wave heights feet\meters
	
	$('.output').on('click', '.buttonOut', function(event) {
		const height = $(this).attr('data-measure');
		const measure = $(this).attr('data-unitsm');
		  //console.log(height, measure)
		LengthConverter(height, measure)

	
    });
   }

$(watchSubmit);