/*var APPLICATION_ID = '<your application ID>',
    SECRET_KEY = '<your javascript secret key>',
    VERSION = 'v1'; //default application version;
Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);*/

/* Backendless Initialization */

// API KEYS
var applicationId = "0DC2B874-874C-0C65-FFA7-A73848315600";
var secretKey = "D3B27983-B5E9-8C94-FF5E-9144856D2800";
var version = "v1";
Backendless.initApp(applicationId, secretKey, version);

/* /Backendless Initialization */

/* User Account Information */

var fn;    // First Name
var ln;    // Last Name
var id;    // Owner ID
var email; // Email

/* /User Account Information */

/*      RETRIEVE PREVIOUS LOGIN     */

window.onload = function () {
    if(getCookie("loggedIn") == "true") {
        function success(data) { 
            console.log("Previous login cookie verified!");
            console.log(data);
            fn = data.first_name;
            ln = data.last_name;
            id = data.ownerId;
            email = data.email;
            setCookie("username", email, 0.3);        
            setCookie("loggedIn", "true", 0.3);
            setUpUserSpace();
        } 
        function error(data){ console.log(data);} 
        Backendless.UserService.isValidLogin(new Backendless.Async(success, error));
    }
}

/*      END RETRIEVE PREVIOUS LOGIN     */   

/*      CLASS STRUCTURE     */

function blog_posts(args) {
    args = args || {};
    this.title = args.title;
    this.description = args.description;
    this.ownerId = args.ownerId;
}

function Users(args)
{
    args = args || {};
    this.fn = args.title;
    this.ln = args.description;
    this.ownerId = args.ownerId;
    this.email = args.email;
}

/*          END CLASS STRUCTURE         */

function demoLogin() {  
    $("div").removeClass("loginCover");
    setUpUserSpace();
}

function login() {
    
    function userLoggedIn( user )
    {
        console.log( "user has logged in" );
        fn = user.first_name;
        ln = user.last_name;
        id = user.ownerId;
        email = user.email;
        setCookie("username", email, 0.3);        
        setCookie("loggedIn", "true", 0.3);
        setUpUserSpace();
    }

    function gotError( err )
    {
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );
    }

    var email = document.getElementById("username").value;
    var pw = document.getElementById("password").value;
    
    Backendless.UserService.login( email, pw, true, new Backendless.Async( userLoggedIn, gotError ) );
}

function register() {
    
    function newUser( user )
    {
        console.log( "User has been registered" );
        fn = user.first_name;
        ln = user.last_name;
        id = user.ownerId;
        email = user.email;
        setCookie("username", email, 0.3);        
        setCookie("loggedIn", "true", 0.3);
        $('#create-modal').modal('hide');
        setUpUserSpace();
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // ADD ERROR CHECKING!
    //////////////////////////////////////////////////////////////////////////////////////////
    
    
    /** Error codes:
    *       - 3000 : Disabled login for this account
    *       - 3002 : Multiple logins
    *       - 3003 : Invalid login creds
    *       - 3006 : One or more empty parameters
    *       - 3036 : Account locked
    *       - 3038 : One or more parameters = NULL    
    */
    
    function gotError( err )
    {
      console.log( "error message - " + err.message );
      console.log( "error code - " + err.statusCode );
    }

    var user = new Backendless.User();
    user.first_name = document.getElementById("fn").value;
    user.last_name = document.getElementById("ln").value;
    user.email = document.getElementById("createEmail").value;
    user.password = document.getElementById("pw").value;
    
    console.log(user);

    Backendless.UserService.register( user, new Backendless.Async( newUser, gotError ) );    
}

function setUpUserSpace() {
    $("div").removeClass("loginCover");
    var blogs = document.getElementById("blogTemplate");
    blogs.style.display = "none";
    document.getElementById("loginRequired").style.display = "none";
    document.getElementById("logoutButtonSection").style.display = "inline";
    document.getElementById("new_comment_user").innerHTML = "<p class='noFluff blogUserStyle text-center'><strong>" + fn + " " + ln +       "</strong></p>";
    retrieveBlogPosts();
}

function retrieveBlogPosts() {
    var blogs = document.getElementById("dbBlog");
    var query = Backendless.Persistence.of( blog_posts ).find();
    var blogPosts = query["data"];  
    
    for(var i = 0; i < blogPosts.length; i++) {
        var newBlogPost = document.createElement("div");
                        
        var contactStorage = Backendless.Persistence.of( Users );
        var dataQuery = new Backendless.DataQuery();
        dataQuery.condition = "ownerId = '" + blogPosts[i].ownerId + "'";
        var myContact = contactStorage.find( dataQuery );
        
        newBlogPost.className = "blogPost";
        newBlogPost.innerHTML = 
            "<div class='blogHeader text-center'>" +
                "<div class='blogTitle'>" +
                    "<p class'noFluff' style='font-size: 16px;'><strong>" + blogPosts[i].title + "</strong></p>" +
                "</div><div class='blogUser text-center'>" + 
                    "<p class='noFluff blogUserStyle text-center'><strong>" + myContact["data"][0].first_name + " " + myContact["data"][0].last_name + "</strong></p>" +
                "</div>" +
            "</div><div class='blogDescription text-center'>" +
                "<p class='blogDescStyle'>" + blogPosts[i].description + "</p>"
            "</div>";
        blogs.appendChild(newBlogPost);
    }
}

function logout() {
    document.getElementById("loginRequired").style.display = "inline";
    document.getElementById("logoutButtonSection").style.display = "none";
    document.getElementById("")
    var blogs = document.getElementById("blogTemplate");
    blogs.style.display = "inline";
    document.getElementById("dbBlog").innerHTML = "";    
    $("#blogs").addClass('loginCover');
    setCookie("loggedIn", "false");
}

function postComment() {
    checkParameters();
    var newPost = new blog_posts({
        title: document.getElementById("new_comment_title").value,
        description: document.getElementById("new_comment_description").value,
        ownerId: id
    });
    
    function postSuccessful(newPost) {        
        alert("Post successful!");
        $("create-post").modal("hide");
    }
    
    function onError(err) {
        console.log(err);
    }
    
    Backendless.Persistence.of( blog_posts ).save(newPost, new Backendless.Async(postSuccessful, onError));
}

function checkParameters() {
    var title = document.getElementById("new_comment_title").value;
    var description = document.getElementById("new_comment_description").value;
    
    if((title != "") && (description != ""))
        document.getElementById("postButton").disabled = false;
    else 
        document.getElementById("postButton").disabled = true;    
}

/******************COOKIE MANAGEMENT********************/

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
    }
}

/**********************************************************/







































