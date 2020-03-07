$(document).ready(function() {
  var pages = 1;
  var page = 1;
  var total = 0;
  var url = [];

  $("#version").html("v0.14");
  
  $("#searchbutton").click( function (e) {
    displayModal();
  });
  
  $("#searchfield").keydown( function (e) {
    if(e.keyCode == 13) {
      displayModal();
    }	
  });
  
  function displayModal() {
    $( "#myModal").modal('show');
    $("#status").html("Searching...");
    $("#dialogtitle").html("Search for: "+$("#searchfield").val());
    $("#previous").hide();
    $("#next").hide();
    $.getJSON('/search/' + $("#searchfield").val() , function(data) {
      renderQueryResults(data);
    });
  }
  
  $("#next").click(function(e) {
    if(page < pages){
      page++;
      updateImages();
    } else {
      page = 1;
      updateImages();
    }
  });
  
  $("#previous").click( function(e) {
    if(page > 1){
      page--;
      updateImages();
    } else {
      page = 6;
      updateImages()
    }
  });

  function updateImages(){
    a = (page - 1) * 6;
    b = (a+6>total) ? total - a: 6;
    renderImg(url.slice(a, a+b));
  }

  function renderQueryResults(data) {
    if (data.error != undefined) {
      $("#status").html("Error: "+ data.error);
    } else {
      $("#status").html("");
      total = data.num_results;
      url = data.results;
      pages = Math.trunc(data.num_results / 6) + 1;
      updateImages();
      if(data.num_results / 6 > 1){
        $("#next").show();
        $("#previous").show();
      } 
     }
   }

  function renderImg(images){
    for(let i = 0; i < 6; i++){
      let image;
      if(images[i]){
        image = document.createElement("img");
        image.src = images[i];
        image.width = 100;
      } else {
        image = ""
      }
      let tag = "#photo" + i;
      $(tag).html(image);
    }
  }
});