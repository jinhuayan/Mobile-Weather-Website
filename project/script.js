var lat;
var long;

var lat1;
var lat2;
var lat3;
var long1;
var long2;
var long3;



function initMap() {
    var city = document.getElementById('city');
    var autoComplete = new google.maps.places.Autocomplete(city);
    google.maps.event.addListener(autoComplete, "place_changed", function () {
        lat = autoComplete.getPlace().geometry.location.lat();
        long = autoComplete.getPlace().geometry.location.lng();
        console.log(lat);
        console.log(long);
    })
}



function showPosition(position) {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
    forcastCall(position.coords.longitude, position.coords.latitude, true);

    currentCall(position.coords.longitude, position.coords.latitude, true);
}




$(document).ready(function () {



    if ($.mobile.activePage && $.mobile.activePage.attr("id") == "pg1") {
        $('#compareBtn').click(function () {
            $.mobile.navigate("#pg2")
        });
        $('#homeBtn').click(function () {
            $.mobile.navigate("#pg1")
        });

        $(window).on('navigate', function () {
            if ($.mobile.activePage && $.mobile.activePage.attr("id") == "pg2") {
                $('#compareSubmit').click(function () {
                    forcastCall(long1, lat1, false, data1);
                    forcastCall(long2, lat2, false, data2);
                    forcastCall(long3, lat3, false, data3);



                    currentCall(long1, lat1, false);
                    currentCall(long2, lat2, false);
                    currentCall(long3, lat3, false);


                })
                multieAutoComplete();
            }
        });


        $('#submit').click(function () {
            forcastCall(long, lat, true);
            currentCall(long, lat, true);
        });
        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported in your browser");
        }

    }
});



function currentCall(longitude, lattitude, flag) {
    var url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat=' + lattitude + '&lon=' + longitude + '&appid=7d2f8fdc5ef5aba4d3197fc3bddd874e';
    const promise = new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = () => {
            if (request.status === 200) {
                var obj = JSON.parse(request.response);
                console.log(obj);
                fillHTML(obj, flag);
            } else {
                reject(Error(request.statusText)); // status is not 200 OK, so reject
            }
        };

        request.onerror = () => {
            reject(Error('Error fetching data.')); // error occurred, reject the  Promise
        };

        request.send(); // send the request
    })
}


var data1 = [];
var data2 = [];
var data3 = [];
var chartLabel = [];
var cityList=[];

function forcastCall(longitude, latitude, flag, data) {
    const promise = new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        var url = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=' + latitude + '&lon=' + longitude + '&appid=7d2f8fdc5ef5aba4d3197fc3bddd874e';
        request.open('GET', url);
        request.onload = () => {
            if (request.status === 200) {
                var obj = JSON.parse(request.response);
                console.log(obj);
                if (flag) {
                    drawChart(obj);
                } else {
                    cityList.push(obj['city']['name']);
                    for (var i in obj.list) {
                        if (i % 2 != 0) {
                            data.push(obj.list[i].main.temp);
                            if (chartLabel.length < 11) {
                                chartLabel.push(obj.list[i].dt_txt.substr(5, 11));
                                
                            }
                        }
                    }
                    if (data1.length > 0 && data2.length > 0 && data3.length > 0) {
                        console.log(cityList);
                        drawCompareChart();
                    }

                }
            } else {
                reject(Error(request.statusText)); // status is not 200 OK, so reject
            }
        };

        request.onerror = () => {
            reject(Error('Error fetching data.')); // error occurred, reject the  Promise
        };

        request.send(); // send the request
    });
}



function drawCompareChart() {
    var ctx = document.getElementById('compareChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabel,
            datasets: [

                {
                    label:cityList[0],
                    fill: false,
                    backgroundColor: 'green',
                    borderColor: 'green',
                    data: data1
                    },
                {
                    label: cityList[1],
                    fill: false,
                    backgroundColor: 'orange',
                    borderColor: 'orange',
                    data: data2
                    },
                {
                    label: cityList[2],
                    fill: false,
                    backgroundColor: 'blue',
                    borderColor: 'blue',
                    data: data3
                    }]
        },
        options: {
            scales: {
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature'
                    }
                    }]
            }
        }
    });
}




function drawChart(obj) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var data = [];
    var rain = [];
    var label = [];
    for (var i in obj.list) {
        if (i % 2 != 0) {
            data.push(obj.list[i].main.temp);
            rain.push(obj.list[i].rain["3h"]);
            label.push(obj.list[i].dt_txt.substr(5, 11));
        }
    }

    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [

                {
                    label: "Rain",
                    fill: true,
                    backgroundColor: "rgb(255, 153, 0)",
                    borderColor: "rgb(255, 153, 0)",
                    data: rain


                },

                {
                    type: 'line',
                    label: "Temperature",
                    fill: false,
                    backgroundColor: 'green',
                    borderColor: 'green',
                    data: data
                    }],
            labels: label
        },
        options: {
            scales: {
                yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Temperature'
                        }
                    },
                    {
                        display: true,
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                            max: 6,
                            min: 0,
                            stepSize: 1.2
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Rainfall'

                        }
                    }]
            }
        }
    });
}

var callTimes = 1;

function fillHTML(obj, flag) {
    if (flag) {
        $('#currentCity').text(obj.name + ', ' + obj.sys.country);
        $('#currentIcon').html("<img src='http://openweathermap.org/img/w/" + obj.weather[0].icon + ".png'>");
        $('#currentTemp').text(obj.main.temp + '℃, ' + obj.weather[0].main);
        $('#clouds').text(obj.clouds.all + '%');
        $('#humidity').text(obj.main.humidity + '%');
        $('#wind').text('Speed - ' + obj.wind.speed);
        $('#pressure').text(obj.main.pressure + 'hpa');

        var sunrise = convertTime(obj.sys.sunrise);
        var sunset = convertTime(obj.sys.sunset);
        $('#sunrise').text(sunrise);
        $('#sunset').text(sunset);
    } else {
        $('#currentCity' + callTimes).text(obj.name + ', ' + obj.sys.country);
        $('#currentIcon' + callTimes).html("<img src='http://openweathermap.org/img/w/" + obj.weather[0].icon + ".png'>");
        $('#currentTemp' + callTimes).text(obj.main.temp + '℃, ' + obj.weather[0].main);
        $('#clouds' + callTimes).text(obj.clouds.all + '%');
        $('#humidity' + callTimes).text(obj.main.humidity + '%');
        $('#wind' + callTimes).text('Speed - ' + obj.wind.speed);
        $('#pressure' + callTimes).text(obj.main.pressure + 'hpa');

        var sunrise = convertTime(obj.sys.sunrise);
        var sunset = convertTime(obj.sys.sunset);
        $('#sunrise' + callTimes).text(sunrise);
        $('#sunset' + callTimes).text(sunset);
        $('#currentTable' + callTimes).css('visibility', 'show');

        callTimes++;
    }
}



function convertTime(unix_timestamp) {
    var date = new Date(unix_timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    return formattedTime = hours + ':' + minutes.substr(-2);

}


function multieAutoComplete() {
    var city1 = document.getElementById('city1');
    var city2 = document.getElementById('city2');
    var city3 = document.getElementById('city3');
    var autoComplete1 = new google.maps.places.Autocomplete(city1);
    var autoComplete2 = new google.maps.places.Autocomplete(city2);
    var autoComplete3 = new google.maps.places.Autocomplete(city3);
    google.maps.event.addListener(autoComplete1, "place_changed", function () {
        lat1 = autoComplete1.getPlace().geometry.location.lat();
        long1 = autoComplete1.getPlace().geometry.location.lng();
        console.log(lat1 + ', ' + long1);
    })
    google.maps.event.addListener(autoComplete2, "place_changed", function () {
        lat2 = autoComplete2.getPlace().geometry.location.lat();
        long2 = autoComplete2.getPlace().geometry.location.lng();
        console.log(lat2 + ', ' + long2);
    })
    google.maps.event.addListener(autoComplete3, "place_changed", function () {
        lat3 = autoComplete3.getPlace().geometry.location.lat();
        long3 = autoComplete3.getPlace().geometry.location.lng();
        console.log(lat3 + ', ' + long3);
    })
}
