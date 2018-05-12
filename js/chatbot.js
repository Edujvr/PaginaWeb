$(function () {

    window.initialMessageDisplayed = false;
    
    
     $(document).mouseenter(function(){
        if(!window.initialMessageDisplayed){
            var obj = JSON.parse($("#dom-target").text());
            var event = obj.result.action;
            var textFromDefaultResponse = obj.result.fulfillment.speech;
            var answerRow = jQuery('<div/>',{
                    'class':'row'
                });
            var answerCol = jQuery('<div/>',{
                    'class':'col'
                });
            var answerContainerDiv = jQuery('<div/>',{
                    'class':"float-right",
                    tabindex:1
                });
            var answerContainerDiv = jQuery('<div/>',{
                    'class':"float-right",
                    tabindex:0
                });
            var simpleResponseRow = jQuery('<div/>',{
                    class:'row'
                });
            var simpleResponseDiv = jQuery('<div/>',{
                class:'textResponse'
                });
            /*var answerdiv = jQuery('<div/>', {
                html: obj.result.fulfillment.speech.linkify()+'&nbsp;',
                'class': "textResponse",
                tabindex:0
            });*/
            $("#chat-text").append(answerRow);
            $(answerRow).append(answerCol);
            $(answerCol).append(answerContainerDiv);
            $(simpleResponseRow).append(simpleResponseDiv);
            $(simpleResponseDiv).html(textFromDefaultResponse);
            $("#message").focus();
            window.initialMessageDisplayed = true;
        }
    });
    
    
    var guid = ($("#sessionId").text()).trim();
    
    $('form').on('submit', function (e) {
        var query = $("#message").val();
        showUserText();
        e.preventDefault();


        $.ajax({
            type: 'post',
            url: 'process.php',
            data: {submit:true, message:query, sessionid: guid},
            success: function (response) {
                $("#message").removeAttr("disabled");
                $('#message').focus();
                var responseObj = JSON.parse(response);
                var speech = responseObj.speech;
                var messages = responseObj.messages;
                var eoc = responseObj.isEndOfConversation;
                var event = responseObj.action;

                var answerRow = jQuery('<div/>',{
                    'class':'row'
                });
                var answerCol = jQuery('<div/>',{
                    'class':'col'
                });
                var answerContainerDiv = jQuery('<div/>',{
                    'class':"float-right",
                    tabindex:0
                });

                $('#chat-text').append(answerRow);
                $(answerRow).append(answerCol);
                $(answerCol).append(answerContainerDiv);


                var textFromDefaultResponse = speech;
                if (textFromDefaultResponse.trim()!==''){
                    renderDefaultResponse(textFromDefaultResponse,answerContainerDiv);
                }
                renderRichControls(messages, answerContainerDiv);


                var isDisabled = $('#message').prop('disabled');
                if(eoc){
                    $('#message').attr("disabled","disabled");
                    $('#chat-text').append('<hr/>');
                    var divMessage = $('<div/>',{
                        class:'d-flex justify-content-center'
                    });
                    var btnStartOver = $('<button/>',{
                        class:'btn btn-sm btn-danger',
                        text:'Comenzar de nuevo'
                    });
                    var textStartOver = $('<h3/>',{
                        html:'Fin de la conversación'
                    });
                    $(divMessage).append(textStartOver);
                    $(btnStartOver).css('margin-left','10px');
                    $(divMessage).append(btnStartOver);
                    $('#chat-text').append(divMessage);
                    $(btnStartOver).click(function(){
                        var textToSubmit = 'Comenzar de nuevo';
                        $("#message").val(textToSubmit);
                        $( "form" ).trigger( "submit" );
                        $(divMessage).addClass('disabledbutton')
                    });
                }
                var objDiv = document.getElementById("chat-text");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    });
});

function renderDefaultResponse(textFromDefaultResponse,parent){
    var simpleResponseRow = jQuery('<div/>',{
        class:'row'
    });
    var simpleResponseDiv = jQuery('<div/>',{
        class:'textResponse'
    });
    $(simpleResponseRow).append(simpleResponseDiv);
    $(simpleResponseDiv).html(textFromDefaultResponse);
    parent.append(simpleResponseRow);
}

function renderRichControls(data, parent){

    var i,len = data.length;
    for(i=0;i<len;i++){
        if(data[i] && data[i].hasOwnProperty('type')){
            if(data[i]['type']==='link_out_chip' &&
                data[i]['platform']==='google'){
                renderLinkOutSuggestion(data[i],parent);
            }
            if(data[i]['type']==='simple_response' &&
                data[i]['platform']==='google'){
                renderSimpleResponse(data[i],parent);
            }
            if(data[i]['type']==='basic_card' &&
                data[i]['platform']==='google'){
                renderBasicCard(data[i],parent);
            }
            if(data[i]['type']==='list_card' &&
                data[i]['platform']==='google'){
                renderList(data[i],parent);
            }
            if(data[i]['type']==='carousel_card' &&
                data[i]['platform']==='google'){
                renderCarousel(data[i],parent);
            }
        }
    }

    for(i=0;i<len;i++){
        if(data[i] && data[i].hasOwnProperty('type')){
            if(data[i]['type']==='suggestion_chips' &&
                data[i]['platform']==='google'){
                renderSuggestionChips(data[i],parent);
            }
        }
    }

}

function renderList(data,parent){

    var i, len = data['items'].length;
    var listGroup = jQuery('<div/>',{
        'class':'list-group card gaListGroup'
    });
    if(data['title']){
        var titleOfCard = data['title'];
        var listGroupHeading = jQuery('<div/>',{
            'class':'gaListHeader card-header deep-orange lighten-1 white-text',
            'html':titleOfCard
        });
        listGroup.append(listGroupHeading);
    }
    for(i=0;i<len;i++){
        var item = data['items'][i];
        if(item){
            var optionTitle = item["title"];
            var optionDescription = item["description"];
            var optionKey = item["optionInfo"]["key"];
            var imageUrl;
            if(item["image"]){
                imageUrl = item["image"]["url"];
            }
            var anchor = jQuery('<a/>',{
                'data-key':optionKey,
                'class':'gaListItem list-group-item list-group-item-action flex-column ' +
                'align-items-start'
            });
            anchor.click(function(){
                if(window.currentSuggestionChips){
                    var buttonRow = window.currentSuggestionChips;
                    buttonRow.remove();
                    window.currentSuggestionChips = null;
                    $("#message").removeAttr("disabled");
                }
                var textToSubmit = $(this).attr('data-key');
                $("#message").val(textToSubmit);
                $( "form" ).trigger( "submit" );
                $(listGroup).addClass('disabledbutton');
            });
            var headingDiv = jQuery('<div/>',{
            });
            var heading = jQuery('<div/>',{
                'class':'card-title',
                'text':optionTitle
            });
            heading.css("font-weight","bold");
            var row = jQuery('<div/>',{
                'class':'row'
            });
            var colSpanText = 'col';
            if(imageUrl) colSpanText = 'col-8';
            var colText = jQuery('<div/>',{
                'class':colSpanText
            });
            var colImage =jQuery('<div/>',{
                'class':'col-4'
            });
            var para = jQuery('<p/>',{
                'class':'mb-1',
                'html':optionDescription
            });

            if(imageUrl){
                var img = jQuery('<img/>',{
                    'class':'img-fluid',
                    'src':imageUrl,
                    'width':'50px'
                });
                colImage.append(img);
            }
            row.append(colText);
            if(imageUrl) row.append(colImage);
            headingDiv.append(heading);
            headingDiv.append(para);
            colText.append(headingDiv);
            anchor.append(row);
            listGroup.append(anchor);
        }
    }
    parent.append(listGroup);
    $("#message").attr("disabled","disabled");
}

function renderCarousel(data,parent){
    var i, len = data['items'].length;
    var carouselContainer = jQuery('<div/>',{
        'width':'550px'
    });
    $(carouselContainer).addClass('gaCarousel');
    var listGroup = jQuery('<ul/>',{

    });
    for(i=0;i<len;i++){
        var item = data['items'][i];
        if(item){
            var optionTitle = truncateString(item["title"],20);
            var optionDescription = item["description"];
            var optionKey = item["optionInfo"]["key"];
            var imageUrl = item["image"]["url"];
            var listItem = jQuery('<li/>',{});
            var cardDiv = jQuery('<div/>',{
                'width':'200px'
            });
            $(cardDiv).addClass('gaCarouselItem');
            var anchor = jQuery('<a/>',{
                'data-key':optionKey,
                'class':'list-group-item list-group-item-action flex-column '+
                'align-items-start'
            });
            anchor.click(function(){
                if(window.currentSuggestionChips){
                    var buttonRow = window.currentSuggestionChips;
                    buttonRow.remove();
                    window.currentSuggestionChips = null;
                    $("#message").removeAttr("disabled");
                }
                var textToSubmit = $(this).attr('data-key');
                $("#message").val(textToSubmit);
                $( "form" ).trigger( "submit" );
                $(carouselContainer).addClass('disabledbutton');
            });
            var heading = jQuery('<div/>',{
                'class':'card-title',
                'text':optionTitle
            });
            heading.css("font-weight","bold");
            var para = jQuery('<p/>',{
                'class':'mb-1',
                'html':optionDescription
            });
            var divForImage = jQuery('<div/>',{
                'class':'card-title'
            });
            divForImage.css("height","100px");
            var img = jQuery('<img/>',{
                'class':'img-fluid',
                'src':imageUrl,
                'width':'100px'
            });
            img.css("margin-left","auto");
            img.css("margin-right","auto");
            img.css("display","block");
            divForImage.append(img);

            cardDiv.append(divForImage);
            anchor.append(heading);
            anchor.append(para);
            cardDiv.append(anchor);
            listItem.append(cardDiv);
            listGroup.append(listItem);
        }
    }
    parent.append(carouselContainer);
    carouselContainer.append(listGroup);
    $(listGroup).lightSlider({
        autoWidth:true
    });
    $("#message").attr("disabled","disabled");
}

function renderBasicCard(data,parent){
    var cardDiv = jQuery('<div/>',{
        'class':'card gaCard'
    });
    var img = jQuery('<img/>',{
        'class':'gaCardImage',
        'src':data['image']['url']
    });
    var cardBodyDiv = jQuery('<div/>',{
        'class':'card-body'
    });
    var strTitle = truncateString(data['title'],28);
    var cardTitleContainerDiv = jQuery('<h5/>',{
        'class':'card-title',
        'html':strTitle
    });

    var textContainerPara = jQuery('<p/>',{
        'class':'card-text',
        'html':data['formattedText']
    });

    var linkDiv = $('<div/>');
    var link = $("<a>");
    link.attr('href',(data['buttons'][0])['openUrlAction']['url']);
    link.attr("title",(data['buttons'][0])['title']);
    link.text((data['buttons'][0])['title']);
    link.addClass("card-link");
    linkDiv.append(link);

    cardDiv.append(img);
    cardBodyDiv.append(cardTitleContainerDiv);
    cardBodyDiv.append(textContainerPara);
    cardBodyDiv.append(linkDiv);
    cardDiv.append(cardBodyDiv);
    parent.append(cardDiv);
}

function renderSimpleResponse(data, parent){
    var simpleResponseDiv = jQuery('<div/>',{
        'class':'row'
    });
    var simpleResponseInnerDiv = jQuery('<div/>',{
        'class':'textResponse gaSimpleResponse'
    });
    var simpleResponseText = jQuery('<p/>',{
        html:data['textToSpeech'],
        tabindex:1
    });
    simpleResponseDiv.append(simpleResponseInnerDiv);
    simpleResponseInnerDiv.append(simpleResponseText);
    parent.append(simpleResponseDiv);
}

function renderLinkOutSuggestion(data, parent){
    var linkoutDiv = jQuery('<div/>', {
        tabindex:1,
        'class': "card gaLinkOutSuggestion"
    });
    var linkoutInnerDiv = jQuery('<div/>',{
        'class':'card-body'
    });
    var linkOutAnchor = jQuery('<a/>',{
        text:data['destinationName']
    });
    $(linkOutAnchor).attr("href",data['url']);
    $(linkOutAnchor).attr("target","_blank");
    $(linkOutAnchor).attr("title",data['destinationName']);
    linkoutDiv.append(linkoutInnerDiv);
    linkoutInnerDiv.append(linkOutAnchor);
    parent.append(linkoutDiv);
}

function renderSuggestionChips(data,parent){
    var i, len = data['suggestions'].length;
    var buttonRowDiv = jQuery('<div/>',{
        class:'row'
    });
    var suggestionChipRowDiv = jQuery('<div/>',{
        class:'gaSuggestionChipRow'
    });
    for (i = 0; i < len; i++) {
        if (data["suggestions"][i]) {
            //make a button for it
            var buttonText = data["suggestions"][i]['title'];
            var button = jQuery('<button/>',{
                //type:'button',
                class:'btn btn-primary btn-sm gaSuggestionChipButton',
                text:buttonText
            });

            button.click(function(){
                var textToSubmit = this.textContent;
                suggestionChipRowDiv.remove();
                window.currentSuggestionChips = null;
                $("#message").removeAttr("disabled");
                $("#message").val(textToSubmit);
                $( "form" ).trigger( "submit" );
            });
        }
        suggestionChipRowDiv.append(button);
    }

    $(buttonRowDiv).append(suggestionChipRowDiv);
    $(parent).append(buttonRowDiv);
    window.currentSuggestionChips = suggestionChipRowDiv;
    //also disable the manual input
    $("#message").attr("disabled","disabled");
}

function showUserText(){
    var userMessageRow = jQuery('<div/>',{
        class:'row'
    });
    var div = jQuery('<div/>', {
        text: $("#message").val(),
        'class': "rounded-div",
        tabindex:1
    });
    $(userMessageRow).append(div);
    $("#chat-text" ).append(userMessageRow);
    $("#message").val('');
}

function truncateString(input, charLimit){
    if(input.length > charLimit) {
        return input.truncate(charLimit)+"...";
    }
    else{
        return input;
    }
}

String.prototype.truncate = String.prototype.truncate ||
    function (n){
        return this.slice(0,n);
    };

if(!String.linkify) {
    String.prototype.linkify = function() {
 
        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
 
        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
 
        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
 
        return this
            .replace(urlPattern,
                '<a class="answerLink" style="color:#0000EE" target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern,
                '$1<a class="answerLink" style="color:#0000EE" target="_blank" href="http://$2">$2</a>')
            .replace(emailAddressPattern,
                '<a class="answerLink" style="color:#0000EE" href="mailto:$&">$&</a>');
    };
}
