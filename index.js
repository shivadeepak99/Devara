$(".profile_card").hide();

$(".profile").on("click", function() {
    $(".profile_card").slideToggle("fast");
});

$(".info").hide();

$(".dash").on("click", function() {
    var id = $(this).attr("id");
    $(".content").children().hide();
    $("." + id).show();
});
