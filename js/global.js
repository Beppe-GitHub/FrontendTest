var g_submissions = [];
$(document).ready(function(){
    if($('body.static').length > 0){
        $('.listing li .block.content .embedded img').click(function(){
            var obj = this;
            if(this.hasAttribute('data-videoSrc')){
                var scrVideo = $(obj).attr('data-videoSrc');
                var iframeWidth = $(obj).width();
                var iframeHeight = $(obj).height();
                $(obj).fadeOut(500, function(){
                    $(obj).parent().append('<iframe width="' + iframeWidth + '" height="' + iframeHeight + '" src="' + scrVideo + '" frameborder="0" allowfullscreen></iframe>');
                    $(obj).parent().find('iframe')[0].src += "?autoplay=1";
                });  
            }
        }); 
    }
    
    if($('body.dynamic').length > 0){
        $('#choiceForm').typeahead({
            ajax: { 
                url: 'json/autocomplete',
                triggerLength: 1,
                displayField: 'label',
                valueField: 'url' 
            },
            onSelect: function(item) {
                $.ajax({
                    url: 'json' + item.value,
                    dataType: 'json'
                }).done(function(data){
                    createForm(data, item.value);
                }).fail(function(a, e, i){
                    console.log(a);
                    console.log(e);
                    console.log(i);
                });
            }
        });   
    }
});

function saveSubmission(){
    var aFields = []; 
    $('.dynamicForm .form-group').each(function(){
        var obj = {
            label: $(this).find('label').html(),
            value: $(this).find('input').val(),
            name: $(this).find('input').attr('name')
        };
        aFields.push(obj);
    });
    
    if($('.dynamicForm').attr('data-position') != null){
        g_submissions[Number($('.dynamicForm').attr('data-position'))].fields = aFields;
    }else{
        var item = {
            url: $('.dynamicForm').attr('data-url'),
            fields: aFields
        };
        g_submissions.push(item);
    }
    
    writeSubmissions();
}

function writeSubmissions(){
    $('.submissionItems').html('');
    for(i = 0; i < g_submissions.length; i++){
        var item = '<li data-position="' + i +'" data-jsonurl="' + g_submissions[i].url + '"><i class="fa fa-trash"></i><i class="fa fa-pencil"></i>';
        item += '<span class="itemNumber">Submission #' + (i+1) +'</span>';
        var aSub = g_submissions[i].fields;
        for(j = 0; j < aSub.length; j++){
            item += '<div class="group"><label>' + aSub[j].label + ':&nbsp;</label>';
            item += '<span class="value">' + aSub[j].value + '</span></div>';
        }
        item += '</li>';
        
        $('.submissionItems').append(item);
    }
    $('.submissionItems li .fa-trash').click(function(e){
        if(confirm('Sei sicuro di voler eliminare la submission?')){
            deleteSubmission(this);
        }
    });
    
    $('.submissionItems li .fa-pencil').click(function(){
        var iPosition = $(this).parent().attr('data-position');
        editSubmission(iPosition);
    });
}

function deleteSubmission(el){
    var iPosition = $(el).parent().attr('data-position');
    g_submissions.splice(iPosition, 1);
    writeSubmissions();
}

function editSubmission(position){
    var obj = g_submissions[position];
    var sUrl = obj.url; //prende url dell'item
    var aFields = obj.fields; // prende fields dell'item
    $.ajax({
        url: 'json' + sUrl,
        dataType: 'json'
    }).done(function(data){
        createForm(data, sUrl, function(){populateForm(aFields, position);});
    }).fail(function(a, e, i){
        console.log(a);
        console.log(e);
        console.log(i);
    });    
}

function createForm(tplForm, urlForm, callback){
    var sHtml = '';
    var minLenError = '';
    var maxLenError = ' ';
    var maxError = ' ';
    var minError = ' ';
    $.each(tplForm, function() {
        sHtml += '<div class="form-group"><label for="' + this.name + '" class="col-sm-2 control-label">' + this.label + '</label>';
        var attrValidator = '';
        var msgError = '';
        $.each(this.rules, function() {
            switch(this.type){
                case 'pattern':
                    attrValidator += 'pattern="/' + this.options.pattern + '/" ';
                    msgError = 'data-error="' + this.msg + '"';
                    break;
                case 'required':
                    attrValidator += 'required ';
                    msgError = 'data-error="' + this.msg + '"';
                    break;
                case 'Inserire una mail valida':
                    attrValidator += 'pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" ';
                    msgError = 'data-error="' + this.type + '"';
                    break;
                case 'max_len':
                    attrValidator += 'data-maxlength="' + this.options.val + '"';
                    maxLenError = this.msg;
                    break;
                case 'min_len':
                    attrValidator += 'data-minlength="' + this.options.val + '"';
                    minLenError = this.msg;
                    break;
                case 'max':
                    attrValidator += 'data-max="' + this.options.val + '" ';
                    maxError = this.msg;
                    break;
                case 'min':
                    attrValidator += 'data-min="' + this.options.val + '" ';
                    minError = this.msg;
                    break;
                    
            }
        });
        
        switch(this.type){
            case 'textarea': 
                break;
            case 'select': 
                break;
            default: 
                sHtml += '<div class="col-sm-10"> \
                            <input class="form-control" placeholder="' + this.label + '" autocomplete="off" type="' + this.type + '" name="' + this.name + '"' + attrValidator + msgError + '> \
                          </div> \
                          <div class="help-block with-errors"></div></div>';
                break;   
        }
    });
    sHtml += '<button type="submit" class="btn btn-default pull-right">Invia</button>';
    $('.choice').fadeOut(500, function(){
        $('.dynamicForm').attr('data-url', urlForm);
        $('.dynamicForm').html(sHtml);
        $('.dynamicForm').fadeIn(); 
        $('.dynamicForm').validator({
            custom: {
                maxlength: function($el) { 
                    var maxLength = $($el).attr('data-maxlength'); 
                    if($($el).val().length > maxLength){
                        return false;
                    }else{
                        return true;
                    }
                },
                max: function($el) { 
                    var max = $($el).attr('data-max'); 
                    if(Number($($el).val()) > max){
                        return false;
                    }else{
                        return true;
                    }
                },
                min: function($el) { 
                    var min = $($el).attr('data-min'); 
                    if(Number($($el).val()) < min){
                        return false;
                    }else{
                        return true;
                    }
                }
            },
            errors: {
                maxlength: maxLenError,
                minlength: minLenError,
                max: maxError,
                min: minError
                    }
        }).on('submit', function(e){
            if (e.isDefaultPrevented()){
                // handle the invalid form...
            }else{
                e.preventDefault();
                saveSubmission();
                $('.dynamicForm').validator('destroy');
                $('.dynamicForm').fadeOut(500, function(){
                    $('.dynamicForm').html('');
                    $('.dynamicForm').removeAttr('data-position');
                    $('.dynamicForm').removeAttr('data-url');
                    $('#choiceForm').val('');
                    $('.choice').fadeIn();
                }); 
            }
       });
       
       if(callback != null && typeof callback == 'function'){
            callback();
       }
       
    });
}

function populateForm(fields, position){
    var sName = '';
    var sValue = '';
    $('.dynamicForm').attr('data-position', position);
    for(i = 0; i < fields.length; i++){
        sName = fields[i].name;
        sValue = fields[i].value;
        $('.dynamicForm .form-group .form-control[name="' + sName + '"]').val(sValue);
    }
}