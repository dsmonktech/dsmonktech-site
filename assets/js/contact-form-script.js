/*==============================================================*/
// Raque Contact Form  JS
/*==============================================================*/
(function ($) {
    "use strict"; // Start of use strict

    var SUBMIT_LIMIT = 2;
    var STORAGE_KEY = "dsmk_contact_submit_count";

    function getSubmitCount(){
        try {
            return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    function incrementSubmitCount(){
        try {
            localStorage.setItem(STORAGE_KEY, String(getSubmitCount() + 1));
        } catch (e) {
            // localStorage unavailable (private browsing, etc.) - fail open, not critical
        }
    }

    function limitReached(){
        return getSubmitCount() >= SUBMIT_LIMIT;
    }

    function applyLimitUI(){
        if (limitReached()) {
            $("#contactForm button[type=submit]").prop("disabled", true).css({opacity: 0.6, cursor: "not-allowed"});
            submitMSG(false, "You've already reached out " + SUBMIT_LIMIT + " times from this device — we'll get back to you soon. Need to send more? Email dsmonktech@gmail.com directly.");
        }
    }

    $(document).ready(applyLimitUI);

    $("#contactForm").validator().on("submit", function (event) {
        if (event.isDefaultPrevented()) {
            // handle the invalid form...
            formError();
            submitMSG(false, "Did you fill in the form properly?");
        } else if (limitReached()) {
            event.preventDefault();
            applyLimitUI();
        } else {
            // everything looks good!
            event.preventDefault();
            submitForm();
        }
    });


    function submitForm(){
        var form = document.getElementById("contactForm");
        var formData = new FormData(form);

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: formData
        })
        .then(function(response){ return response.json(); })
        .then(function(data){
            if (data.success) {
                formSuccess();
            } else {
                formError();
                submitMSG(false, data.message || "Something went wrong, please try again.");
            }
        })
        .catch(function(){
            formError();
            submitMSG(false, "Something went wrong, please try again.");
        });
    }

    function formSuccess(){
        $("#contactForm")[0].reset();
        incrementSubmitCount();
        submitMSG(true, "Message Submitted!");
        if (limitReached()) {
            setTimeout(applyLimitUI, 1500);
        }
    }

    function formError(){
        $("#contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            $(this).removeClass();
        });
    }

    function submitMSG(valid, msg){
        if(valid){
            var msgClasses = "h4 tada animated text-success";
        } else {
            var msgClasses = "h4 text-danger";
        }
        $("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
    }
}(jQuery)); // End of use strict