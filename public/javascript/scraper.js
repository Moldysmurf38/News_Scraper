$("#web-scraper").on("click", function () {
    $("#scraper-status").empty();
    $("#scraper-redirect").empty();
    $("#article-link").empty();
    $.post("/scraper")
        .then(function (data) {
            $("#scraper-status").empty();
            $("#scraper-status").html("Looking for new articles...")
            setTimeout(function () {
                $("#scraper-status").html("Scrape Complete");
                $("#scraper-redirect").html("Check out new articles here:");
                var artLink = $("<a>");
                artLink.attr("class", "article-link");
                artLink.attr("href", "/articles");
                $("#article-link").append(artLink);
                $(".article-link").html("Click Here");
            }, 7000);
        });
});
$.getJSON("/api/articles", function (data) {
    for (var x = 0; x < data.length; x++) {
        $("#article-list").append("<div data-id='" + data[x]._id + "' class='article-title'>" + "<p>" + data[x].title + "</p>" + "<a class='"+data[x].id+"' href= " + data[x].link + " target=_blank> </a>" + "</div>")
        $("."+data[x].id).text("Check out the article here.");
        $("."+data[x].id).removeClass();
    };
});
$(document).on("click", ".article-title", function () {
    $("#note-div").empty();
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    .then(function (data) {
            console.log(data);

            $("#note-div").append("<div class='row' id='note-content'><div>");
            $("#note-content").append("<div class='col-md-12' id='note-title'><div>");
            $("#note-title").append("<h2>" + data.title + "</h2>");
            $("#note-content").append("<div class='col-md-12' id='note-body'><div>");
            $("#note-body").append("<input class='form-control' id='title-input' name='title'></div>");
            $("#note-content").append("<div class='col-md-12' id='body-text'><div>");
            $("#body-text").append("<textarea class='form-control' rows='5' id='body-input' name='body'></textarea>");
            $("#note-content").append("<div class='col-md-12' id='note-save'><div>");
            $("#note-save").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
            if (data.note) {
                $("#title-input").val(data.note.title);
                $("#body-input").val(data.note.body);
            };
        });
});
$(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            title: $("#title-input").val(),
            body: $("#body-input").val()
        }
    })
    .then(function (data) {
        console.log(data);
        $("#notes").empty();
    });
    $("#title-input").val("");
    $("#body-input").val("");
});