<!DOCTYPE html>
<html>
<head lang="ru">
    <meta charset="UTF-8">
    <title>Обратный звонок</title>
    <!--    <script type="text/javascript" src="widgets/backcall/js/live.js"></script>-->
    <style type="text/css">
        .backcall-button {
            background-color: aquamarine;
            border: 1px solid red;
            position: fixed;
            width: 150px;
            border: 1px solid black;
            bottom: 20px;
            right: 20px;
            cursor: pointer;
        }

        .backcall-button:hover {
            background-color: #0088cc;
            cursor: pointer;
        }
    </style>
<!--    <script src='https://www.google.com/recaptcha/api.js'></script>-->
</head>
<body>
<h1>Lorem Ipsum</h1>

<p>
    Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam
    eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam
    voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione
    voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci
    velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut
    enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
    consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae
    consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio
    dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias
    excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id
    est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum
    soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis
    voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum
    necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic
    tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus
    asperiores repellat.
</p>

<p>
    Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam
    eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam
    voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione
    voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci
    velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut
    enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
    consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae
    consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio
    dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias
    excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id
    est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum
    soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis
    voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum
    necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic
    tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus
    asperiores repellat.
</p>

<div class="backcall-button">Обратный звонок</div>

<?php

include_once "config.php";

?>

<script type="text/javascript" src="widgets/backcall/js/l.min.js" async>
    typeof window.ljs !== 'undefined' && window.ljs.load('widgets/backcall/js/app.min.js', function () {
        var backcallButton = document.getElementsByClassName('backcall-button')[0];
        window.app.core.run({
            button: backcallButton,
            appHomePath : 'widgets/backcall',
            serverHandlerPath: 'widgets/backcall/backcall.php',
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

</body>
</html>