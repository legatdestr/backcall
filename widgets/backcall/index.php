<script type="text/javascript" src="/feedback/backcall/js/l.min.js">
    typeof window.ljs !== 'undefined' && window.ljs.load('/feedback/backcall/js/app.min.js', function () {
        var backcallButton = document.querySelector('#mbr div.popupmenu a[href="#backcall"]');
        window.app.core.run({
            button: backcallButton,
            appHomePath :  '/feedback/backcall',
            serverHandlerPath: '/feedback/backcall/backcall.php',
            captchaPath: 'https://www.google.com/recaptcha/api.js?hl=ru',
            captchaSitekey : "6Lc-9gkTAAAAAE_IbFzVhyu-Pyk8DWUd0RoM2vVP",
            telMask : "9(999)999-99-99", // not required - default is "9(999)999-99-99"
            telValidateRegExp : '^[8]{1}\\(9[\\d]{2}\\)[\\d]{3}-[\\d]{2}-[\\d]{2}$', // not required, default: 8(9XX)XXX-XX-XX
            afterOpen: function(modal){

            },
            afterClose: function(){

            }
        });
    });
</script>