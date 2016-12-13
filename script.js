
$(document).ready(function(){
	
	var shown = "top";
	var total_pages;
	var current_page;
	var pagination_set = false;
	

	var api_key = "api_key=d6567c81b3f90902e0886a226056f0d6";
	var base_url ="https://api.themoviedb.org/3";
	
	
	var req_url =  base_url + "/movie/top_rated?" + api_key;
	$.getJSON(req_url, addMovies);

	function addMovies(data){
		
		current_page = data.page; 
		total_pages = data.total_pages;
		
		if(!pagination_set){ 
			setPagination();
		}
		
		var $posters = $(".posters");
		$posters.empty();

		
		var $row;
		
		var movies = data.results;
		$.each(movies, function(index,value){
			
			if(index % 4 == 0){
				$posters.append("<br/>");
				$row = $("<div class='row'></div>");
				$posters.append($row);
			}

			var $div = $("<div class='col-md-3'></div>");
			var $img = $("<img></img>");
			
			$img.attr({ 
				src : "http://image.tmdb.org/t/p/w300" + value.poster_path,
				title: value.title,
				id: value.id,
				class: "img-thumbnail"
			});
			$div.append($img);
			$row.append($div);
			
		});
	}
	
	$("#topRated").click(function(){
		
		pagination_set = false;
		shown = "top";
		

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Top Rated Movies");

		var req_url =  base_url + "/movie/top_rated?" + api_key;
		$.getJSON(req_url, addMovies);
	});

	$("#upcoming").click(function(){
		
		pagination_set = false;
		shown = "upcoming";

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Upcoming Movies");

		var req_url =  base_url + "/movie/upcoming?" + api_key;
		$.getJSON(req_url, addMovies);
	});

	$("#nowplaying").click(function(){

		pagination_set = false;
		shown = "now";

		$(this).parent().siblings().removeClass("active");
		$(this).parent().addClass("active");
		$("h2.naslov").text("Now Playing");

		var req_url =  base_url + "/movie/now_playing?" + api_key;
		$.getJSON(req_url, addMovies);
	});

	$(".container").on("click","img", function(e){
        
		var req_url = base_url + "/movie/" + $(this).attr("id") + "?" + api_key;
        
		$(".movie").fadeOut(100);

		$.getJSON(req_url,function(data,status){
            
			var $movieDiv = $(".movie");

			var $img = $movieDiv.find("img");
			$img.attr("src", "http://image.tmdb.org/t/p/w185" + data.poster_path);
			
			$movieDiv.find("a.title").text(data.title + " (" + data.release_date.split("-")[0] + ")")
									 .attr("href", "http://www.imdb.com/title/" + data.imdb_id);
			

			var $ul = $movieDiv.find("ul");
			$ul.empty();
			
			$ul.append("<li>" + parseInt(data.runtime/60) + "h " + data.runtime%60 + "min</li>");
			$ul.append("<li>|</li>");
			
			$.each(data.genres, function(index, value){
				var $li = $("<li></li>");
				var text = "" + value.name;

				if(index != data.genres.length-1)
					text +=",";
				
				$li.text(text);
				$ul.append($li);
			});
			$ul.append("<li>|</li>");
			
			
			var formater = new Intl.DateTimeFormat("sr");
			$ul.append("<li>" + formater.format(new Date(data.release_date)) + "</li>");
			$ul.append("<li>|</li>");
			
			$ul.append("<li>Rating: " + data.vote_average + 
				"<span class='glyphicon glyphicon-star' style='color:#ffcc00'></span> - " 
				+ data.vote_count + " votes</li>");

			$movieDiv.find("#description").text(data.overview);

			var productionCompaines = "";
			$.each(data.production_companies,function(index, value){
				productionCompaines += value.name;
				if(index != data.production_companies.length-1)
					productionCompaines += ", ";
			});

			$movieDiv.find("#production").text("Production companies: " + productionCompaines);
			

			var l10nUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
			$movieDiv.find("#budget").text("Budget: " + l10nUSD.format(data.budget));
			$movieDiv.find("#revenue").text("Revenue: " + l10nUSD.format(data.revenue));
			
			$movieDiv.find("#tagline").text("Tagline: " + data.tagline);


			if($movieDiv.css("display") == "none")
				$movieDiv.slideDown("slow");
			else{
				$movieDiv.fadeIn();
			}
			
			$("button.simmilar").show(10).attr({
												id: data.id,
												title: $("a.title").text() 
											});
			
		});
	});
	
	$(".container").on("click", "button.simmilar", function(){
		var movieId = $(this).attr("id");
		var movieTitle = $(this).attr("title");
		$("h2.naslov").text("Similar to: " + movieTitle);

		var req_url =  base_url + "/movie/" + movieId +"/similar?" + api_key;
		$.getJSON(req_url, addMovies);
		
	});
	
	$("button.search").click(function(){
		var query = "query="+$("#tbInput").val();
		var req_url =  base_url + "/search/movie?" + query + "&" + api_key;
		$("h2.naslov").text("Results for: " + $("#tbInput").val());
		$.getJSON(req_url, addMovies);
	});
	
	function setPagination(){
		
		pagination_set = true;

		var $ulPag = $("ul.pagination");
		$ulPag.empty();
		
		var i;
		for(i = current_page; i < current_page + 5; i++){
			var li = $("<li></li>");
			var a = $("<a href='#' title='"+i+"''>"+i+"</a>");
			li.append(a);

			if(i == current_page){
				li.addClass("active");
			}
			$ulPag.append(li);


			if(i == total_pages)
				break;
		}

		if(i < total_pages){
			var li = $("<li></li>");
			var a = $("<a href='#' title='"+i+"''></a>");
			a.text(">>");
			li.append(a);
			$ulPag.append(li);
		}
	}


	$("ul.pagination").on("click", "a", function(){
		var $ulPag = $("ul.pagination");
		
		var request_page = parseInt($(this).attr("title")); 
			
		if($(this).text() == ">>"){
			$ulPag.empty(); 
			if(request_page + 5 >= total_pages){
				var i;
				var flag = false;
				for(i = total_pages; i > total_pages - 5; i--){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.prepend(li);
					
					if(i == 1){ 
						flag = true;
						break;
					}
				}
				if(!flag){ 
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text("<<");
					li.append(a);
					$ulPag.prepend(li);
				}
			}else{
				
				var li = $("<li></li>");
				var a = $("<a href='#' title='"+(request_page+5)+"'></a>");
				a.text(">>")
				li.append(a);
				$ulPag.append(li);

				var i;
				var flag = false;
				
				for(i = request_page + 4; i >= request_page; i--){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.prepend(li);
					if(i == 1){
						flag = true;
						break;
					}
				}
				if(!flag){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text("<<");
					li.append(a);
					$ulPag.prepend(li);
				}
			}
		}else if($(this).text() == "<<"){
			$ulPag.empty();
			 
			if(request_page - 5 <= 1){
				var i;
				var flag = false;
				
				for(i = 1; i < 6; i++){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.append(li);

					if(i == total_pages){
						flag = true;
						break;
					}
				}
				if(!flag){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text(">>");
					li.append(a);
					$ulPag.append(li);
				}
			}else{
				var li = $("<li></li>");
				var a = $("<a href='#' title='"+(request_page-5)+"'></a>");
				a.text("<<")
				li.append(a);
				$ulPag.append(li);
				var flag = false;
				var i;
				for(i = request_page - 4; i <= request_page; i++){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'>"+i+"</a>");
					li.append(a);
					if(i == request_page){
						li.addClass("active");
					}
					$ulPag.append(li);
					if(i == total_pages){
						flag = true;
						break;
					}
				}
				if(!flag){
					var li = $("<li></li>");
					var a = $("<a href='#' title='"+i+"'></a>");
					a.text(">>");
					li.append(a);
					$ulPag.append(li);
				}
			}
		}else{

			$(this).parent().siblings().removeClass("active");
			$(this).parent().addClass("active");
		}

		switch(shown){
			case "top":
				var req_url =  base_url + "/movie/top_rated?" + api_key + "&" + "page=" + request_page; 
				$.getJSON(req_url, addMovies);
			break;
			case "upcoming":
				var req_url =  base_url + "/movie/upcoming?" + api_key + "&" + "page=" + request_page;
				$.getJSON(req_url, addMovies);
			break;
			case "now":
				var req_url =  base_url + "/movie/now_playing?" + api_key + "&" + "page=" + request_page;
				$.getJSON(req_url, addMovies);
				break;
		}
	});

	

	


	

	$(".container").on("mouseenter",".posters img",function(){
		$(this).fadeTo(50,0.7);
	});
	$(".container").on("mouseleave",".posters img",function(){
		$(this).fadeTo(50,1);
	})
});