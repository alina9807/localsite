$(function(){
 $('#search,#searchCity').on('keyup', function(e){
   if(e.keyCode === 13) {
     var parameters = { search: $('#search').val(), searchCity:$('#searchCity').val() };
       $.get( '/searching',parameters, function(data) {
	   if(data == ''){
		data = 'No Results Found';
	   }
       $('#results').html(data);
     });
    };
 });
});