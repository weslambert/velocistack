var tm_filter = null;
var selector_active;
var current_timeline;
var g_event_id = null;
var g_event_desc_editor = null;

function edit_in_event_desc() {
    if($('#container_event_desc_content').is(':visible')) {
        $('#container_event_description').show(100);
        $('#container_event_desc_content').hide(100);
        $('#event_edition_btn').hide(100);
        $('#event_preview_button').hide(100);
    } else {
        $('#event_preview_button').show(100);
        $('#event_edition_btn').show(100);
        $('#container_event_desc_content').show(100);
        $('#container_event_description').hide(100);
    }
}

/* Fetch a modal that allows to add an event */
function add_event() {
    url = 'timeline/events/add/modal' + case_param();
    $('#modal_add_event_content').load(url, function (response, status, xhr) {
        hide_minimized_modal_box();
        if (status !== "success") {
             ajax_notify_error(xhr, url);
             return false;
        }

        g_event_desc_editor = get_new_ace_editor('event_description', 'event_desc_content', 'target_event_desc',
                            function() {
                                $('#last_saved').addClass('btn-danger').removeClass('btn-success');
                                $('#last_saved > i').attr('class', "fa-solid fa-file-circle-exclamation");
                            }, null);

        g_event_desc_editor.setOption("minLines", "10");
        headers = get_editor_headers('g_event_desc_editor', null, 'event_edition_btn');
        $('#event_edition_btn').append(headers);
        edit_in_event_desc();

        $('#submit_new_event').on("click", function () {
            clear_api_error();
            var data_sent = $('#form_new_event').serializeObject();
            data_sent['event_date'] = `${$('#event_date').val()}T${$('#event_time').val()}`;
            data_sent['event_in_summary'] = $('#event_in_summary').is(':checked');
            data_sent['event_in_graph'] = $('#event_in_graph').is(':checked');
            data_sent['event_sync_iocs_assets'] = $('#event_sync_iocs_assets').is(':checked');
            data_sent['event_tags'] = $('#event_tags').val();
            data_sent['event_assets'] = $('#event_assets').val();
            data_sent['event_iocs'] = $('#event_iocs').val();
            data_sent['event_tz'] = $('#event_tz').val();
            data_sent['event_content'] = g_event_desc_editor.getValue();

            ret = get_custom_attributes_fields();
            has_error = ret[0].length > 0;
            attributes = ret[1];

            if (has_error){return false;}

            data_sent['custom_attributes'] = attributes;

            post_request_api('timeline/events/add', JSON.stringify(data_sent), true)
            .done((data) => {
                if(notify_auto_api(data)) {
                    window.location.hash = data.data.event_id;
                    apply_filtering();
                    $('#modal_add_event').modal('hide');
                }
            });

            return false;
        })

        $('#modal_add_event').modal({ show: true });
        $('#event_title').focus();

    });
}

function save_event() {
    $('#submit_new_event').click();
}


function duplicate_event(id) {
    window.location.hash = id;
    clear_api_error();

    get_request_api("timeline/events/duplicate/" + id)
    .done((data) => {
        if(notify_auto_api(data)) {
            if ("data" in data && "event_id" in data.data)
            {
                window.location.hash = data.data.event_id;
            }
            apply_filtering();
        }
    });

}
function update_event(event_id) {
    update_event_ext(event_id, true);
}

function update_event_ext(event_id, do_close) {

    if (event_id === undefined || event_id === null) {
        event_id = g_event_id;
    }

    window.location.hash = event_id;
    clear_api_error();
    var data_sent = $('#form_new_event').serializeObject();
    data_sent['event_date'] = `${$('#event_date').val()}T${$('#event_time').val()}`;
    data_sent['event_in_summary'] = $('#event_in_summary').is(':checked');
    data_sent['event_in_graph'] = $('#event_in_graph').is(':checked');
    data_sent['event_sync_iocs_assets'] = $('#event_sync_iocs_assets').is(':checked');
    data_sent['event_tags'] = $('#event_tags').val();
    data_sent['event_assets'] = $('#event_assets').val();
    data_sent['event_iocs'] = $('#event_iocs').val();
    data_sent['event_tz'] = $('#event_tz').val();
    data_sent['event_content'] = g_event_desc_editor.getValue();
    ret = get_custom_attributes_fields();
    has_error = ret[0].length > 0;
    attributes = ret[1];

    if (has_error){return false;}

    data_sent['custom_attributes'] = attributes;

    post_request_api('timeline/events/update/' + event_id, JSON.stringify(data_sent), true)
    .done(function(data) {
        if(notify_auto_api(data)) {
            apply_filtering();
            if (do_close !== undefined && do_close === true) {
                $('#modal_add_event').modal('hide');
            }

            $('#submit_new_event').text("Saved").addClass('btn-outline-success').removeClass('btn-outline-danger').removeClass('btn-outline-warning');
            $('#last_saved').removeClass('btn-danger').addClass('btn-success');
            $('#last_saved > i').attr('class', "fa-solid fa-file-circle-check");

        }
    });

}

/* Delete an event from the timeline thank to its id */ 
function delete_event(id) {
    window.location.hash = id;
    do_deletion_prompt("You are about to delete event #" + id)
    .then((doDelete) => {
        if (doDelete) {
            post_request_api("timeline/events/delete/" + id)
            .done(function(data) {
                if(notify_auto_api(data)) {
                    apply_filtering();
                    $('#modal_add_event').modal('hide');
                }
            });
        }
    });
}

/* Edit an event from the timeline thanks to its ID */
function edit_event(id) {
  url = '/case/timeline/events/' + id + '/modal' + case_param();
  window.location.hash = id;
  $('#modal_add_event_content').load(url, function (response, status, xhr) {
        hide_minimized_modal_box();
        if (status !== "success") {
             ajax_notify_error(xhr, url);
             return false;
        }
        
        g_event_id = id;
        g_event_desc_editor = get_new_ace_editor('event_description', 'event_desc_content', 'target_event_desc',
                            function() {
                                $('#last_saved').addClass('btn-danger').removeClass('btn-success');
                                $('#last_saved > i').attr('class', "fa-solid fa-file-circle-exclamation");
                            }, null);
        g_event_desc_editor.setOption("minLines", "6");
        preview_event_description(true);
        headers = get_editor_headers('g_event_desc_editor', null, 'event_edition_btn');
        $('#event_edition_btn').append(headers);
        
        load_menu_mod_options_modal(id, 'event', $("#event_modal_quick_actions"));
        $('#modal_add_event').modal({show:true});
  });
}

function preview_event_description(no_btn_update) {
    if(!$('#container_event_description').is(':visible')) {
        event_desc = g_event_desc_editor.getValue();
        converter = get_showdown_convert();
        html = converter.makeHtml(do_md_filter_xss(event_desc));
        event_desc_html = do_md_filter_xss(html);
        $('#target_event_desc').html(event_desc_html);
        $('#container_event_description').show();
        if (!no_btn_update) {
            $('#event_preview_button').html('<i class="fa-solid fa-eye-slash"></i>');
        }
        $('#container_event_desc_content').hide();
    }
    else {
        $('#container_event_description').hide();
         if (!no_btn_update) {
            $('#event_preview_button').html('<i class="fa-solid fa-eye"></i>');
        }

        $('#event_preview_button').html('<i class="fa-solid fa-eye"></i>');
        $('#container_event_desc_content').show();
    }
}

function is_timeline_compact_view() {
    var x = localStorage.getItem('iris-tm-compact');
    if (typeof x !== 'undefined') {
        if (x === 'true') {
            return true;
        }
    }
    return false;
}

function toggle_compact_view() {
    var x = localStorage.getItem('iris-tm-compact');
    if (typeof x === 'undefined') {
        localStorage.setItem('iris-tm-compact', 'true');
        location.reload();
    } else {
        if (x === 'true') {
            localStorage.setItem('iris-tm-compact', 'false');
            location.reload();
        } else {
             localStorage.setItem('iris-tm-compact', 'true');
            location.reload();
        }
    }
}

function toggle_selector() {
    //activating selector toggle
    if(selector_active == false) {
        selector_active = true;

        //blend in conditional buttons to perform actions on selected rows - e.g. select graph, summary, color
        $(".btn-conditional").show(250);
        //highligh the selection button
        $("#selector-btn").addClass("btn-active");
        //$("#selector-btn").load();
        //remove data toggle attribute to disable expand feature
        $("[id^=dropa_]").removeAttr('data-toggle');

        //create click handler for timeline events
        $(".timeline li .timeline-panel").on('click', function(){
            if($(this).hasClass("timeline-selected")) {
                $(this).removeClass("timeline-selected");
            } else {
                $(this).addClass("timeline-selected");
            }
        });
    

    }

    //deactivating selector toggle
    else if(selector_active == true) {
        selector_active = false;
        $(".btn-conditional").hide(250);
        $(".btn-conditional-2").hide(250);
        $("#selector-btn").removeClass("btn-active");
        //restore the collapse feature
        $("[id^=dropa_]").attr('data-toggle','collapse');
        $(".timeline-selected").removeClass("timeline-selected");

        $(".timeline li .timeline-panel").off('click');
        apply_filtering();
    }
}

function toggle_colors() { 
    // console.log("toggling colors");
    var color_buttons = $(".btn-conditional-2");
    color_buttons.slideToggle(250);
    // console.log(color_buttons);
}

function events_set_attribute(attribute, color) {

    var attribute_value;

    var selected_rows = $(".timeline-selected");

    if(selected_rows.length <= 0) {
        console.log("no rows selected, returning");
        return true;
    }

    switch(attribute) {
        case "event_in_graph":
            break;
        case "event_in_summary":
            break;
        case "event_color":
            attribute_value = color;
            var color_buttons = $(".btn-conditional-2");
            color_buttons.slideToggle(250);
            break;
        default:
            console.log("invalid argument given");
            return false;
    }

    //loop through events and toggle/set selected attribute
    selected_rows.each(function(index) {
        var object = selected_rows[index];
        var event_id = object.getAttribute('id').replace("event_",""); 

        var original_event;

        //get event data
        get_request_api("timeline/events/" + event_id)
        .done((data) => {
            original_event = data.data;
            if(notify_auto_api(data, true)) {
                //change attribute to selected value
                if(attribute === 'event_in_graph' || attribute === 'event_in_summary'){
                    attribute_value = original_event[attribute];
                    original_event[attribute] = !attribute_value;
                } else if(attribute === 'event_color') {
                    // attribute value already set to color L240
                    original_event[attribute] = attribute_value;
                }

                //add csrf token to request
                original_event['csrf_token'] = $("#csrf_token").val();
                delete original_event['event_comments_map'];

                //send updated event to API
                post_request_api('timeline/events/update/' + event_id, JSON.stringify(original_event), true)
                .done(function(data) {
                    notify_auto_api(data);
                    if (index === selected_rows.length - 1) {
                        get_or_filter_tm(function() {
                            selected_rows.each(function() {
                                var event_id = this.getAttribute('id')
                                $('#' + event_id).addClass("timeline-selected");
                            });
                        });
                    }
                });
            }
        });
    });
}

function events_bulk_delete() {
    var selected_rows = $(".timeline-selected");
    if(selected_rows.length <= 0) {
        console.log("no rows selected, returning");
        return true;
    }

    swal({
        title: "Are you sure?",
        text: "You are about to delete " + selected_rows.length + " events.\nThere is no coming back.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete them'
    })
    .then((willDelete) => {
        if (willDelete) {
            selected_rows.each(function(index) {
                var object = selected_rows[index];
                var event_id = object.getAttribute('id').replace("event_","");
                post_request_api("timeline/events/delete/" + event_id)
                .done(function(data) {
                    notify_auto_api(data);
                    if (index === selected_rows.length - 1) {
                        get_or_filter_tm();
                    }
                });
            });
        } else {
            swal("Pfew, that was close");
        }
    });
}

function build_timeline(data) {
    var compact = is_timeline_compact_view();
    var is_i = false;
    current_timeline = data.data.tim;
    tmb = [];

    reid = 0;

    $('#time_timeline_select').empty();

    var standard_filters = [
                {value: 'asset:', score: 10, meta: 'Match assets of events'},
                {value: 'startDate:', score: 10, meta: 'Match end date of events'},
                {value: 'endDate:', score: 10, meta: 'Match end date of events'},
                {value: 'tag:', score: 10, meta: 'Match tag of events'},
                {value: 'description:', score: 10, meta: 'Match description of events'},
                {value: 'flag', score: 10, meta: 'Match flagged events'},
                {value: 'category:', score: 10, meta: 'Match category of events'},
                {value: 'title:', score: 10, meta: 'Match title of events'},
                {value: 'source:', score: 10, meta: 'Match source of events'},
                {value: 'raw:', score: 10, meta: 'Match raw data of events'},
                {value: 'ioc', score: 10, meta: "Match ioc in events"},
                {value: 'AND ', score: 10, meta: 'AND operator'}
              ]

    for (rid in data.data.assets) {
        standard_filters.push(
             {value: data.data.assets[rid][0], score: 1, meta: data.data.assets[rid][1]}
        );
    }

    for (rid in data.data.categories) {
        standard_filters.push(
             {value: data.data.categories[rid], score: 1, meta: "Event category"}
        );
    }

    tm_filter.setOptions({
          enableBasicAutocompletion: [{
            getCompletions: (editor, session, pos, prefix, callback) => {
              callback(null, standard_filters);
            },
          }],
          enableLiveAutocompletion: true,
    });

    var tesk = false;
    // Prepare replacement mod
    var reap = [];
    ioc_list = data.data.iocs;
    for (ioc in ioc_list) {

        var capture_start = "(^|;|:|||>|<|[|]|(|)|\s|\>)(";
        var capture_end = ")(;|:|||>|<|[|]|(|)|\s|>|$|<br/>)";
        // When an IOC contains another IOC in its description, we want to avoid to replace that particular pattern
        var avoid_inception_start = "(?!<span[^>]*?>)" + capture_start;
        var avoid_inception_end = "(?![^<]*?<\/span>)" + capture_end;
        var re = new RegExp(avoid_inception_start
               + escapeRegExp(sanitizeHTML(ioc_list[ioc]['ioc_value']))
               + avoid_inception_end
               ,"g");
        replacement = `$1<span class="text-warning-high ml-1 link_asset" data-toggle="popover" style="cursor: pointer;" data-trigger="hover" data-content="${sanitizeHTML(ioc_list[ioc]['ioc_description'])}" title="IOC">${sanitizeHTML(ioc_list[ioc]['ioc_value'])}</span>`;
        reap.push([re, replacement]);
    }
    idx = 0;

    converter = get_showdown_convert();

    for (index in data.data.tim) {
        evt = data.data.tim[index];
        dta =  evt.event_date.split('T');
        tags = '';
        cats = '';
        tmb_d = '';
        style = '';
        asset = '';

        if (evt.event_id in data.data.comments_map) {
            nb_comments = data.data.comments_map[evt.event_id].length;
        } else {
            nb_comments = '';
        }

        if(evt.category_name && evt.category_name != 'Unspecified') {
             if (!compact) {
                 tags += `<span class="badge badge-light float-right ml-1 mt-2">${sanitizeHTML(evt.category_name)}</span>`;
             } else {
                 if (evt.category_name != 'Unspecified') {
                     cats += `<span class="badge badge-light float-right ml-1 mt-1 mr-2 mb-1">${sanitizeHTML(evt.category_name)}</span>`;
                 }
             }
        }
        
        if (evt.iocs != null && evt.iocs.length > 0) {
            for (ioc in evt.iocs) {
                tags += `<span class="badge badge-warning-event float-right ml-1 mt-2" data-toggle="popover" data-trigger="hover" style="cursor: pointer;" data-content="IOC - ${sanitizeHTML(evt.iocs[ioc].description)}"><i class="fa-solid fa-virus-covid"></i> ${sanitizeHTML(evt.iocs[ioc].name)}</span>`;
            }
        }

        if (evt.event_tags != null && evt.event_tags.length > 0) {
            sp_tag = evt.event_tags.split(',');
            for (tag_i in sp_tag) {
                    tags += `<span title="Tag" class="badge badge-light ml-1 float-right mt-2"><i class="fa-solid fa-tag mr-1"></i>${sanitizeHTML(sp_tag[tag_i])}</span>`;
                }
        }

        /* Do we have a border color to set ? */
        style = "";
        if (tesk) {
            style += "timeline-odd";
            tesk = false;
        } else {
            style += "timeline-even";
            tesk = true;
        }

        style_s = "style='";
        if (evt.event_color != null) {
                style_s += "border-left: 2px groove " + sanitizeHTML(evt.event_color);
        }

        style_s += ";'";

        /* For every assets linked to the event, build a link tag */
        if (evt.assets != null) {
            for (ide in evt.assets) {
                cpn =  evt.assets[ide]["ip"] + ' - ' + evt.assets[ide]["description"]
                cpn = sanitizeHTML(cpn)
                if (evt.assets[ide]["compromised"]) {
                    asset += `<span class="badge badge-warning-event float-right ml-2 link_asset mt-2" data-toggle="popover" data-trigger="hover" style="cursor: pointer;" data-content="${cpn}" title="${sanitizeHTML(evt.assets[ide]["name"])}">${sanitizeHTML(evt.assets[ide]["name"])}</span>`;
                } else {
                    asset += `<span class="badge badge-light float-right ml-1 link_asset mt-2" data-toggle="popover" data-trigger="hover" style="cursor: pointer;" data-content="${cpn}" title="${sanitizeHTML(evt.assets[ide]["name"])}">${sanitizeHTML(evt.assets[ide]["name"])}</span>`;
                }
            }
        }

        ori_date = '<span class="ml-3"></span>';
        if (evt.event_date_wtz != evt.event_date) {
            ori_date += `<i class="fas fa-info-circle mr-1" title="Locale date time ${evt.event_date_wtz}${evt.event_tz}"></i>`
        }

        if(evt.event_in_summary) {
            ori_date += `<i class="fas fa-newspaper mr-1" title="Showed in summary"></i>`
        }

        if(evt.event_in_graph) {
            ori_date += `<i class="fas fa-share-alt mr-1" title="Showed in graph"></i>`
        }
        

        day = dta[0];
        mtop_day = '';
        if (!tmb.includes(day)) {
            tmb.push(day);
            if (!compact) {
                tmb_d = `<div class="time-badge" id="time_${idx}"><small class="text-muted">${day}</small><br/></div>`;
            } else {
                tmb_d = `<div class="time-badge-compact" id="time_${idx}"><small class="text-muted">${day}</small><br/></div>`;
            }
            idx += 1;
            mtop_day = 'mt-4';
        }

        title_parsed = match_replace_ioc(sanitizeHTML(evt.event_title), reap);
        content_parsed = converter.makeHtml(do_md_filter_xss(evt.event_content));
        content_parsed = filterXSS(content_parsed);

        if (!compact) {
            content_split = content_parsed.split('<br/>');
            lines = content_split.length;
            if (content_parsed.length > 150 || lines > 2) {
                if (lines > 2) {
                    short_content = match_replace_ioc(content_split.slice(0,2).join('<br/>'), reap);
                    long_content = match_replace_ioc(content_split.slice(2).join('<br/>'), reap);
                } else {
                    offset = content_parsed.slice(150).indexOf(' ');
                    short_content = match_replace_ioc(content_parsed.slice(0, 150 + offset), reap);
                    long_content = match_replace_ioc(content_parsed.slice(150 + offset), reap);
                }
                formatted_content = short_content + `<div class="collapse" id="collapseContent-${evt.event_id}">
                ${long_content}
                </div>
                <a class="btn btn-link btn-sm" data-toggle="collapse" href="#collapseContent-${evt.event_id}" role="button" aria-expanded="false" aria-controls="collapseContent">&gt; See more</a>`;
                formatted_content = formatted_content;
            } else {
                formatted_content = match_replace_ioc(content_parsed, reap);
            }
        }

        shared_link = buildShareLink(evt.event_id);

        flag = '';
        if (evt.event_is_flagged) {
            flag = `<i class="fas fa-flag text-warning" title="Flagged"></i>`;
        } else {
            flag = `<i class="fa-regular fa-flag" title="Not flagged"></i>`;
        }

        if (compact) {
            entry = `<li class="timeline-inverted ${mtop_day}" title="Event ID #${evt.event_id}">
                ${tmb_d}
                    <div class="timeline-panel ${style}" ${style_s} id="event_${evt.event_id}" >
                        <div class="timeline-heading">
                            <div class="btn-group dropdown float-right">
                                ${cats}
                                <button type="button" class="btn btn-light btn-xs" onclick="edit_event(${evt.event_id})" title="Edit">
                                    <span class="btn-label">
                                        <i class="fa fa-pen"></i>
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs" onclick="flag_event(${evt.event_id})" title="Flag">
                                    <span class="btn-label">
                                        ${flag}
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs" onclick="comment_element(${evt.event_id}, 'timeline/events')" title="Comments">
                                    <span class="btn-label">
                                        <i class="fa-solid fa-comments"></i><span class="notification" id="object_comments_number_${evt.event_id}">${nb_comments}</span>
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                    <span class="btn-label">
                                        <i class="fa fa-cog"></i>
                                    </span>
                                </button>
                                <div class="dropdown-menu" role="menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 32px, 0px); top: 0px; left: 0px; will-change: transform;">
                                        <a href= "#" class="dropdown-item" onclick="copy_object_link(${evt.event_id});return false;"><small class="fa fa-share mr-2"></small>Share</a>
                                        <a href= "#" class="dropdown-item" onclick="copy_object_link_md('event', ${evt.event_id});return false;"><small class="fa-brands fa-markdown mr-2"></small>Markdown Link</a>
                                        <a href= "#" class="dropdown-item" onclick="duplicate_event(${evt.event_id});return false;"><small class="fa fa-clone mr-2"></small>Duplicate</a>
                                        <div class="dropdown-divider"></div>
                                        <a href= "#" class="dropdown-item text-danger" onclick="delete_event(${evt.event_id});"><small class="fa fa-trash mr-2"></small>Delete</a>
                                </div>
                            </div>
                            <div class="collapsed" id="dropa_${evt.event_id}" data-toggle="collapse" data-target="#drop_${evt.event_id}" aria-expanded="false" aria-controls="drop_${evt.event_id}" role="button" style="cursor: pointer;">
                                <span class="text-muted text-sm float-left mb--2"><small>${evt.event_date}</small></span>
                                <a class="text-dark text-sm ml-3" href="${shared_link}" onclick="edit_event(${evt.event_id});return false;">${title_parsed}</a>
                            </div>
                        </div>
                        <div class="timeline-body text-faded" >
                            <div id="drop_${evt.event_id}" class="collapse" aria-labelledby="dropa_${evt.event_id}" style="">
                                <div class="card-body">
                                ${content_parsed}
                                </div>
                                <div class="bottom-hour mt-2">
                                    <span class="float-right">${tags}${asset} </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>`
        } else {
            entry = `<li class="timeline-inverted" title="Event ID #${evt.event_id}">
                    ${tmb_d}
                    <div class="timeline-panel ${style}" ${style_s} id="event_${evt.event_id}" >
                        <div class="timeline-heading">
                            <div class="btn-group dropdown float-right">

                                <button type="button" class="btn btn-light btn-xs" onclick="edit_event(${evt.event_id})" title="Edit">
                                    <span class="btn-label">
                                        <i class="fa fa-pen"></i>
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs" onclick="flag_event(${evt.event_id})" title="Flag">
                                    <span class="btn-label">
                                        ${flag}
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs" onclick="comment_element(${evt.event_id}, 'timeline/events')" title="Comments">
                                    <span class="btn-label">
                                        <i class="fa-solid fa-comments"></i><span class="notification" id="object_comments_number_${evt.event_id}">${nb_comments}</span>
                                    </span>
                                </button>
                                <button type="button" class="btn btn-light btn-xs dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                    <span class="btn-label">
                                        <i class="fa fa-cog"></i>
                                    </span>
                                </button>
                                <div class="dropdown-menu" role="menu" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 32px, 0px); top: 0px; left: 0px; will-change: transform;">
                                        <a href= "#" class="dropdown-item" onclick="copy_object_link(${evt.event_id});return false;"><small class="fa fa-share mr-2"></small>Share</a>
                                        <a href= "#" class="dropdown-item" onclick="copy_object_link_md('event', ${evt.event_id});return false;"><small class="fa-brands fa-markdown mr-2"></small>Markdown Link</a>
                                        <a href= "#" class="dropdown-item" onclick="duplicate_event(${evt.event_id});return false;"><small class="fa fa-clone mr-2"></small>Duplicate</a>
                                        <div class="dropdown-divider"></div>
                                        <a href= "#" class="dropdown-item text-danger" onclick="delete_event(${evt.event_id});"><small class="fa fa-trash mr-2"></small>Delete</a>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <a class="timeline-title" href="${shared_link}" onclick="edit_event(${evt.event_id});return false;">${title_parsed}</a>
                            </div>
                        </div>
                        <div class="timeline-body text-faded" >
                            <span>${formatted_content}</span>

                            <div class="bottom-hour mt-2">
                                <div class="row">
                                    <div class="col-4 d-flex">
                                        <span class="text-muted text-sm align-self-end float-left mb--2"><small><i class="flaticon-stopwatch mr-2"></i>${evt.event_date}${ori_date}</small></span>
                                    </div>
                                    <div class="col-8 ">
                                        <span class="float-right">${tags}${asset} </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>`
        }
        is_i = false;

        //entry = match_replace_ioc(entry, reap);
        $('#timeline_list').append(entry);


    }
    //match_replace_ioc(data.data.iocs, "timeline_list");
    $('[data-toggle="popover"]').popover();

    if (data.data.tim.length === 0) {
       $('#timeline_list').append('<h3 class="ml-mr-auto text-center">No events in current view</h3>');
    }

    set_last_state(data.data.state);
    hide_loader();

    if (location.href.indexOf("#") != -1) {
        var current_url = window.location.href;
        var id = current_url.substr(current_url.indexOf("#") + 1);
        if ($('#event_'+id).offset() != undefined) {
            $('html, body').animate({ scrollTop: $('#event_'+id).offset().top - 180 });
            $('#event_'+id).addClass('fade-it');
        }
    }

    // re-enable onclick event on timeline if selector_active is true
    if(selector_active == true) {
        $(".timeline li .timeline-panel").on('click', function(){
            if($(this).hasClass("timeline-selected")) {
                $(this).removeClass("timeline-selected");
            } else {
                $(this).addClass("timeline-selected");
            }
        });
    }
}

function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function match_replace_ioc(entry, reap) {

    for (rak in reap) {
        entry = entry.replace(reap[rak][0], reap[rak][1]);
    }
    return entry;
}

function to_page_up() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function to_page_down() {
    window.scrollTo(0,document.body.scrollHeight);
  }

function show_time_converter(){
    $('#event_date_convert').show();
    $('#event_date_convert_input').focus();
    $('#event_date_inputs').hide();
}

function hide_time_converter(){
    $('#event_date_convert').hide();
    $('#event_date_inputs').show();
    $('#event_date').focus();
}

function flag_event(event_id){
    get_request_api('timeline/events/flag/'+event_id)
    .done(function(data) {
        if (notify_auto_api(data)) {
            if (data.data.event_is_flagged == true) {
                $('#event_'+event_id).find('.fa-flag').addClass('fas text-warning').removeClass('fa-regular');
                $('#event_210').find('.fa-flag').addClass('fas text-warning').removeClass('fa-regular');
            } else {
                $('#event_'+event_id).find('.fa-flag').addClass('fa-regular').removeClass('fas text-warning');
            }
        }
    });
}

function time_converter(){
    date_val = $('#event_date_convert_input').val();

    var data_sent = Object();
    data_sent['date_value'] = date_val;
    data_sent['csrf_token'] = $('#csrf_token').val();

    post_request_api('timeline/events/convert-date', JSON.stringify(data_sent))
    .done(function(data) {
        if(notify_auto_api(data)) {
            $('#event_date').val(data.data.date);
            $('#event_time').val(data.data.time);
            $('#event_tz').val(data.data.tz);
            hide_time_converter();
            $('#convert_bad_feedback').text('');
        }
    })
    .fail(function() {
        $('#convert_bad_feedback').text('Unable to find a matching pattern for the date');
    });
}

function goToSharedLink(){
    if (location.href.indexOf("#") != -1) {
        var current_url = window.location.href;
        var id = current_url.substr(current_url.indexOf("#") + 1);
        if ($('#event_'+id).offset() != undefined) {
            return;
        }
   }
   shared_id = getSharedLink();
   if (shared_id) {
        $('html, body').animate({ scrollTop: $('#event_'+shared_id).offset().top - 80 });
        $('#event_'+shared_id).addClass('fade-it');
    }
}

function timelineToCsv(){
    csv_data = "event_date(UTC),event_title,event_description,event_tz,event_date_wtz,event_category,event_tags,linked_assets,linked_iocs\n";
    for (index in current_timeline) {
        item = current_timeline[index];
        content = item.event_content.replace(/"/g, '\"');
        content_parsed = content.replace(/(\r?\n)+/g, ' - ');
        title = item.event_title.replace(/"/g, '\"');
        tags = item.event_tags.replace(/"/g, '\"');
        assets = "";
        for (k in item.assets) {
            asset = item.assets[k].name.replace(/"/g, '\"');
            assets += `${asset};`;
        }
        iocs = "";
        for (k in item.iocs) {
            ioc = item.iocs[k].name.replace(/"/g, '\"');
            iocs += `${ioc};`;
        }
        csv_data += `"${item.event_date}","${title}","${content_parsed}","${item.event_tz}","${item.event_date_wtz}","${item.category_name}","${tags}","${assets}","${iocs}"\n`;
    }
    download_file("iris_timeline.csv", "text/csv", csv_data);
}

function timelineToCsvWithUI(){
    csv_data = "event_date(UTC),event_title,event_description,event_tz,event_date_wtz,event_category,event_tags,linked_assets,linked_iocs,created_by,creation_date\n";
    for (index in current_timeline) {

        item = current_timeline[index];
        content = item.event_content.replace(/"/g, '\"');
        content_parsed = content.replace(/(\r?\n)+/g, ' - ');
        title = item.event_title.replace(/"/g, '\"');
        tags = item.event_tags.replace(/"/g, '\"');
        assets = "";
        for (k in item.assets) {
            asset = item.assets[k].name.replace(/"/g, '\"');
            assets += `${asset};`;
        }
        iocs = "";
        for (k in item.iocs) {
            ioc = item.iocs[k].name.replace(/"/g, '\"');
            iocs += `${ioc};`;
        }
        csv_data += `"${item.event_date}","${title}","${content_parsed}","${item.event_tz}","${item.event_date_wtz}","${item.category_name}","${tags}","${assets}","${iocs}","${item.user}","${item.event_added}"\n`;
    }
    download_file("iris_timeline.csv", "text/csv", csv_data);
}

var parsed_filter = {};
var keywords = ['asset', 'tag', 'title', 'description', 'ioc', 'raw', 'category', 'source', 'flag', 'startDate', 'endDate'];


function parse_filter(str_filter, keywords) {
  for (var k = 0; k < keywords.length; k++) {
  	keyword = keywords[k];
    items = str_filter.split(keyword + ':');

    ita = items[1];

    if (ita === undefined) {
    	continue;
    }

    item = split_bool(ita);

    if (item != null) {
      if (!(keyword in parsed_filter)) {
        parsed_filter[keyword] = [];
      }
      if (!parsed_filter[keyword].includes(item)) {
        parsed_filter[keyword].push(item.trim());
        console.log('Got '+ item.trim() + ' as ' + keyword);
      }

      if (items[1] != undefined) {
        str_filter = str_filter.replace(keyword + ':' + item, '');
        if (parse_filter(str_filter, keywords)) {
        	keywords.shift();
        }
      }
    }
  }
  return true;
}

function filter_timeline() {
    current_path = location.protocol + '//' + location.host + location.pathname;
    new_path = current_path + case_param() + '&filter=' + encodeURIComponent(tm_filter.getValue());
    window.location = new_path;
}

function reset_filters() {
    current_path = location.protocol + '//' + location.host + location.pathname;
    new_path = current_path + case_param();
    window.location = new_path;
}

function apply_filtering(post_req_fn) {
    keywords = ['asset', 'tag', 'title', 'description', 'ioc', 'raw', 'category', 'source', 'flag', 'startDate', 'endDate'];
    parsed_filter = {};
    parse_filter(tm_filter.getValue(), keywords);
    filter_query = encodeURIComponent(JSON.stringify(parsed_filter));

    $('#timeline_list').empty();
    show_loader();
    get_request_data_api("/case/timeline/advanced-filter",{ 'q': filter_query })
    .done((data) => {
        if(notify_auto_api(data, true)) {
            build_timeline(data);
            if(post_req_fn !== undefined) {
                post_req_fn();
            }
        }
        goToSharedLink();
    });
}

function getFilterFromLink(){
    queryString = window.location.search;
    urlParams = new URLSearchParams(queryString);

    if (urlParams.get('filter') !== undefined) {
        return urlParams.get('filter')
    }
    return null;
}

function get_or_filter_tm(post_req_fn) {
    filter = getFilterFromLink();
    if (filter) {
        tm_filter.setValue(filter);
        apply_filtering(post_req_fn);
    } else {
        apply_filtering(post_req_fn);
    }
}

function show_timeline_filter_help() {
    $('#modal_help').load('/case/timeline/filter-help/modal' + case_param(), function (response, status, xhr) {
        if (status !== "success") {
             ajax_notify_error(xhr, '/case/timeline/filter-help/modal');
             return false;
        }
        $('#modal_help').modal('show');
    });
}

/* Page is ready, fetch the assets of the case */
$(document).ready(function(){

    selector_active = false;

    tm_filter = ace.edit("timeline_filtering",
    {
        autoScrollEditorIntoView: true,
        minLines: 1,
        maxLines: 5
    });
    tm_filter.setTheme("ace/theme/tomorrow");
    tm_filter.session.setMode("ace/mode/json");
    tm_filter.renderer.setShowGutter(false);
    tm_filter.setShowPrintMargin(false);
    tm_filter.renderer.setScrollMargin(10, 10);
    tm_filter.setOption("displayIndentGuides", true);
    tm_filter.setOption("indentedSoftWrap", true);
    tm_filter.setOption("showLineNumbers", false);
    tm_filter.setOption("placeholder", "Filter timeline");
    tm_filter.setOption("highlightActiveLine", false);
    tm_filter.commands.addCommand({
                        name: "Do filter",
                        bindKey: { win: "Enter", mac: "Enter" },
                        exec: function (editor) {
                                  filter_timeline();
                        }
    });
    $('#time_timeline_select').on('change', function(e){
        id = $('#time_timeline_select').val();
        $('html, body').animate({ scrollTop: $('#time_'+id).offset().top - 180 });
    });

    get_or_filter_tm();

    setInterval(function() { check_update('timeline/state'); }, 3000);

});

