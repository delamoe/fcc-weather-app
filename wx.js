var wxugKey = 'ade1114e6eb51ee9';
//var dUnit = 'mi', pUnit = 'm';

getData();

function getData() {
  var lat, lon;
  //check for geoloc
  if (!navigator.geolocation) {
    // if not...
    $('.coords').html('Location<br/>Unavailable');
  }
  // maybe create option for manually location selection

  var options = {
    enableHighAccuracy: true,
    timeout: 100,
    maximumAge: 0
  };

  //navigator.geolocation.getCurrentPosition(function () {}, function () {}, {});
  navigator.geolocation.getCurrentPosition(function(position, error, options) {
    var t = position.coords.latitude;
    var g = position.coords.longitude;

    //console.log('JavaScript -- \n lat ', t, ' lon ', g)

    var loc = t.toFixed(7) + ',' + g.toFixed(7),
      dlat = parseInt(t),
      mslat = (t - dlat) * 60,
      mlat = parseInt(mslat),
      slat = (mslat - mlat) * 60,
      dlon = parseInt(g),
      mslon = (g - dlon) * 60,
      mlon = parseInt(mslon),
      slon = (mslon - mlon) * 60,
      dmsLat = 'Latitude: ' + dlat + '° ' + mlat + "' " + slat.toFixed(2) + '"',
      dmsLon = 'Longitude: ' + dlon + '° ' + mlon + "' " + slon.toFixed(2) + '"';

    $('#lat').html(dmsLat);
    $('#lon').html(dmsLon);

    $.ajax({
      url: "https://api.wunderground.com/api/" + wxugKey + "/geolookup/conditions/q/" + loc + ".json",
      dataType: "jsonp",
      success: function(data) {
        console.log(data);
        var place = data.location.city + ', ' + data.location.country_name,
          pc = data.current_observation;
        var iconUrl = pc.icon_url.replace(/http/, 'https').replace(/k\//, 'i/'),
          iconAlt = pc.icon,
          iconImg = "<img src = '" + iconUrl + "'alt=" + iconAlt + ">",
          sky = pc.weather,
          temp_c = pc.temp_c,
          temp_f = pc.temp_f,
          humid = pc.relative_humidity,
          feels_f = pc.feelslike_f,
          feels_c = pc.feelslike_c,
          vis_m = pc.visibility_mi,
          vis_km = pc.visibility_km,
          press_mb = pc.pressure_mb,
          press_in = pc.pressure_in,
          dewP_f = pc.dewpoint_f,
          dewP_c = pc.dewpoint_c,
          windD = pc.wind_dir,
          wind_m = pc.wind_mph,
          wind_kn = parseInt(wind_m * 0.85),
          wind_km = pc.wind_kph;
        var windG_m = pc.wind_gust_mph < 1 ? '' : pc.wind_gust_mph;
        var windG_kn = pc.wind_gust_mph < 1 ? '' : parseInt(pc.wind_mph * 0.85);
        var windG_km = pc.wind_gust_kph < 1 ? '' : pc.wind_gust_kph;

        var wind, vis;
        var gust_kilo, gust_knot, gust_mile;
	var dUnit = 'mi';
        $('#dBtn').on('click', function() { //distance unit selection
          if (dUnit === 'km') {
            dUnit = 'kn';
           // console.log(dUnit);
            gust_knot = windG_kn < 1 ? '' : '— Gusting to ' + windG_kn + ' Knots';
            wind = 'Wind is ' + wind_kn + ' Knots from the ' + windD + gust_knot;
            vis = 'Visibility is ' + vis_m + ' Statute Miles';
          } else if (dUnit === 'kn') {
            dUnit = 'mi';
           // console.log(dUnit);
            gust_mile = windG_m < 1 ? '' : '— Gusting to ' + windG_m + ' mph';
            wind = 'Wind is ' + wind_m + ' mph from the ' + windD + gust_mile;
            vis = 'Visibility is ' + vis_m + ' Statute Miles';
          } else if (dUnit === 'mi') {
            dUnit = 'km';
           // console.log(dUnit);
            gust_kilo = windG_km < 1 ? '' : '— Gusting to ' + windG_km + ' kph';
            wind = 'Wind is ' + wind_km + ' kph from the ' + windD + gust_kilo;
            vis = 'Visibility is ' + vis_km + ' Kilometers';
          }

          $('#wind').html(wind + '<br />');

          if (vis_m !== 'N/A') {
            $('#vis').html(vis + '<br />');
          }
        });
        $("#dBtn").trigger("click");



        

        if (feels_c > 42) {
          $('#container').addClass('hotbg');
        } else if (feels_c > 32) {
          $('#container').addClass('warmbg');
        } else if (feels_c > 22) {
          $('#container').addClass('coolbg');
        } else if (feels_c > 12) {
          $('#container').addClass('coldbg');
        } else {
          $('#container').addClass('freezebg');
        }

        $('#place').html(place + "<br />current conditions:<br />");
        $('#sky').html(iconImg + ' ' + sky + ' ' + iconImg + '<br />');

        function baro(x) {
          if (x === 'm') return pc.pressure_in;
          return pc.pressure_mb;
        }

        function pTrend() {
          //console.log(pc.pressure_trend);
          if (pc.pressure_trend === '+') {
            return ' & Increasing';
          } else if (pc.pressure_trend === '-') {
            return ' & Decreasing';
          } else {
            return '';
          }
        }
	var pUnit = 'm', pLabel;
        $('#pBtn').on('click', function() { //pressure unit selection
          console.log('#pBtn clicked');
          var press;
          if (pUnit === 'm') {
            pUnit = 'h';
            pLabel = '" of Mercury';
            press = baro(pUnit) + ' kPa' + pTrend();
          } else {
            pUnit = 'm';
            pLabel = 'Kilopascals';
            press = baro(pUnit) + '" Hg' + pTrend();
          }
          $('#pBtn').html(pLabel);
          $('#baro').html('Barometer is at ' + press + '<br />');
          ////console.log(pUnit);
        });

        $("#pBtn").trigger("click");

        function temp(x) {
          if (x === 'f') return pc.temp_f + '° F @ ' + humid + ' Humidity = Feels like ' + pc.feelslike_f + '° F<br />';
          return pc.temp_c + '° C @ ' + humid + ' Humidity = Feels like ' + pc.feelslike_c + '° C<br />';
        }
        var tUnit = 'f';
        $('#tBtn').on('click', function() {
          if (tUnit === 'f') {
            tUnit = 'c';
            $('#tBtn').html('° Fahrenheit');
            $('#temp').html(temp('c'));
          } else {
            tUnit = 'f';
            $('#tBtn').html('° Celsius');
            $('#temp').html(temp('f'));
          }
        });

        $("#tBtn").trigger("click");
      }

    });
  });
}
  

  function setHeight() { //set container full height
    windowHeight = $(window).innerHeight();
    $('#container').css('min-height', windowHeight);
  }

  setHeight();

  $(window).resize(function() { //call setHeight
    setHeight();

});

/*"current_observation": {
		"precip_1hr_in":"0.00",
		"precip_1hr_metric":" 0",
		"precip_today_string":"0.00 in (0 mm)",
		"precip_today_in":"0.00",
		"precip_today_metric":"0",
		}
    */