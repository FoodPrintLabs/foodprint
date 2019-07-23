function changeContent(parameter1, parameter2) {
    var element = document.getElementById(parameter1);
    element.innerHTML = parameter2;
} /* used to change content of the farmer/fruit blurbs*/


    Swal.fire({
    title: 'Sweet!',
    text: 'Modal with a custom image.',
    imageUrl: 'https://unsplash.it/400/200',
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: 'Custom image',
    animation: false
  }) /* A message with a custom image and CSS animation disabled */

$(function(){
    $('#targetbutton').on('click', function(){
        $('#fruitModal1').toggle();
    })
})
  


//<!--JQuery CDN-->
//<script src="https://code.jquery.com/jquery-3.4.1.js" integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU=" crossorigin="anonymous"></script>



