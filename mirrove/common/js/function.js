/************* lessonのjs ***************/


$(function() {

    

    // ② プログラム画像をホバーすると拡大
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



    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#pageTop').fadeIn();
        } else {
            $('#pageTop').fadeOut();
        }
    });

    $('#pageTop').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 600);
    });

});



$(function() {

    // 緑の枠と画像を少しずらして重ねる
    $('.frPersonal, .flFood').css({
        'position': 'relative'
    });

    // 画像を最初は少し下にずらす
    $('.frPersonal img, .flFood img').css({
        'opacity': '0',
        'transform': 'translateY(40px)'
    });

    // スクロールしたら画像が登場
    $(window).on('scroll', function() {

        $('.frPersonal img, .flFood img').each(function() {

            var imgTop = $(this).offset().top;
            var scrollTop = $(window).scrollTop();
            var windowHeight = $(window).height();

            if (scrollTop + windowHeight > imgTop + 100) {

                $(this).stop().animate({
                    'opacity': 1
                }, 1000);

                $(this).css({
                    'transform': 'translateY(0)',
                    'transition': 'transform 1s ease'
                });

            }

        });

    });

});

$(function() {

    $('.instructor_photo img').hover(

        function() {
            $(this).css({
                'filter': 'brightness(0.9)',
                'transition': '0.4s'
            });
        },

        function() {
            $(this).css({
                'filter': 'brightness(0.7)',
                'transition': '0.4s'
            });
        }

    );

});