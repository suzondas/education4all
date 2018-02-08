//custom console
function c(param){
	console.log(param)
}

$(function () {
  $("#datepicker").datepicker({ 
        autoclose: true, 
        todayHighlight: true
  }).datepicker('update', new Date());
});

setTimeout(function() {
            $('#messages').fadeOut('fast');
            }, 4000); // <-- time in milliseconds

function changeBranchCR(){
		$("#branch-cr").empty();
	var branches = $("#region-cr").find(':selected').attr('data-branch-cr');
	// c(branches);
	if(branches){
	branches = JSON.parse(branches);
		for(var i=0;i<branches.length;i++){
			$("#branch-cr").append('<option value="'+branches[i].local+'">'+branches[i].item.toUpperCase()+'</option>');
		}
	}
}
function changeBranchOPT(){
		$("#branch-opt").empty();
	var branches = $("#region-opt").find(':selected').attr('data-branch-opt');
	// c(branches);
	if(branches){
	branches = JSON.parse(branches);
		for(var i=0;i<branches.length;i++){
			$("#branch-opt").append('<option value="'+branches[i].local+'">'+branches[i].item.toUpperCase()+'</option>');
		}
	}
}