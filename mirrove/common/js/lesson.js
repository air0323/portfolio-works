/************* lessonのjs ***************/


$(function() {

    // プログラム画像のホバー時の透明度変更
    $('.photo img').hover(
        function() {
            $(this).stop().animate({
                opacity: 0.8
            }, 300);
        },
        function() {
            $(this).stop().animate({
                opacity: 1
            }, 300);
        }
    );


    // プログラム画像のホバー時の透明度変更
    $(window).on('scroll', function() {

        if ($(this).scrollTop() > 300) {
            $('#pageTop').fadeIn();
        } else {
            $('#pageTop').fadeOut();
        }

        // パーソナルレッスンふわっと出てくる
        $('.frPersonal img, .flFood img').each(function() {

            var imgTop = $(this).offset().top;
            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();

            if (scrollTop + windowHeight > imgTop + 100) {

                $(this).stop().animate({
                    opacity: 1
                }, 1000);

                $(this).css({
                    transform: 'translateY(0)',
                    transition: 'transform 0.8s ease'
                });

            }

        });

    });


   // パーソナルレッスンふわっと出てくる
    $('.frPersonal, .flFood').css({
        position: 'relative'
    });

    $('.frPersonal img, .flFood img').css({
        opacity: 0,
        transform: 'translateY(40px)'
    });




    // インストラクター画像ホバー時の明るさ変更
    $('.instructor_photo img').hover(

        function() {
            $(this).css({
                filter: 'brightness(0.9)',
                transition: '0.4s'
            });
        },

        function() {
            $(this).css({
                filter: 'brightness(0.7)',
                transition: '0.4s'
            });
        }

    );

});


