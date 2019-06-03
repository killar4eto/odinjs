let cache = [];
let garbage = [];
let newItem = [];
let debug = false;
let toolbar = false;
let initialized = false;
const version = "1.0";
let lookedItem = {};

odin = {
    initialize: () => {
        if(initialized) {return false;}

        cache = [];
        garbage = [];
        newItem = [];
        debug = false;
        toolbar = false;

        //Handles shortcuts
        let iShortCutControlKey = "Control";
        let iShortCutAltKey = "Alt";
        let bIsControlKeyActived = {
            key: 'Control',
            status: false
        };
        let bIsAltKeyActived = {
            key: 'Alt',
            status: false
        };

        $(document).keyup(function(e) {
            e.preventDefault();

            if (e.key === iShortCutControlKey) bIsControlKeyActived.status = false;
            if (e.key === iShortCutAltKey) bIsAltKeyActived.status = false;
        }).keydown(function(e) {
            if(e.key !== "F12") {
                e.preventDefault();

                if (e.key === iShortCutControlKey) bIsControlKeyActived.status = true;
                if (e.key === iShortCutAltKey) bIsAltKeyActived.status = true;

                if (bIsControlKeyActived || bIsAltKeyActived) {
                    $.each(arrShortCut, function (i) {
                        if (arrShortCut[i].key === e.key && arrShortCut[i].trigger === bIsControlKeyActived.key) {
                            eval(arrShortCut[i].fx);
                            return;
                        }

                        if (arrShortCut[i].key === e.key && arrShortCut[i].trigger === bIsAltKeyActived.key) {
                            eval(arrShortCut[i].fx);
                            return;
                        }
                    });
                }
            }
        });

        //Handle right clicks
        window.oncontextmenu = (event) => {
            let x = event.clientX;
            let y = event.clientY;
            let target = event.target;


            if(target.id.length === 0){
                //Apply new id
                target.id = odin.uniqueId();
            }

            odin.make.draggable(("#"+target.id));


            return false;
        };

        //Element click handler
        $(".playing_field").mouseup((event) => {
            if(event.which === 1) {
                odin.get.item(event.target);
            }
        });

        //Toolbar
        odin.toolbar.render();

        //Update initialized
        initialized = true;

        console.log("Running OdinJS v"+version);
    },
    debug: {
        enable: () => { debug = true },
        disable: () => { debug = false },
        status: () => { return debug }
    },
    get: {
        item: (item) => {
            //Clean object
            lookedItem = {};

            item = $(item);
            const id = item.attr("id");
            const classesIncluded = typeof(item.attr('class')) !== "undefined" ? item.attr('class') : null;
            const position = item.position();
            const size = {width: item.width(), height: item.height()};
            let typeItem = null;

            //Get the type
            cache.map((type) => {
                if(type.id === id){
                    typeItem = type.params[0].value;
                }
            });

            lookedItem = {id, classesIncluded, position, size, typeItem};

            if(toolbar){
                $("#odin_toolbar_item_id").html(id);
                $("#odin_toolbar_item_type").html(typeItem);
                $("#odin_toolbar_item_position").html("<span>Top: "+position.top+"</span> <span>Left: "+position.left+"</span>");
                $("#odin_toolbar_item_size").html("<span>Width: "+size.width+"</span> <span>Height: "+size.height+"</span>");
                $("#odin_toolbar_item_classes").html(classesIncluded);
            }

            odin.catch.return(lookedItem);
        }
    },
    catch: {
        return: (event) => {

            if(odin.debug.status()) {
                console.log(event);
            }

            return event;
        }
    },
    create: (params) => {
        let type = null;
        let paramsString = [];
        let value = null;
        let id = null;

        if("id" in params){
            id = params["id"];
        }
        else{
            id = odin.uniqueId();
        }

        Object.keys(params).forEach((key) => {
            if(key === "type"){
                type = params[key];
            }

            if(key === "value"){
                value = params[key];
            }

            //Insert into paramsString
            paramsString.push({key: key, value: params[key]});
        });

        if(type !== null ) {
            //Search for type and implement
            odin.types(type, id, value);

            //If done continue adding to document with value
            if(newItem.length >= 1){
                $(".playing_field").append(newItem);
            }

            //Add to cache
            odin.cache.add({event: 'create', id: id, params: paramsString});

            //Clean new item
            newItem = [];

            //Return response
            odin.catch.return(type + " has been created.");
        }
        else{
            //Return response
            odin.catch.return("WRONG PARAMS!");
        }
    },
    types: (type, id, value) => {
        type = type.toLowerCase();

        let bItem = odin.helpers.html(type);

        newItem.push($(bItem.code).attr('id', id).text(value));
    },
    cache:  {
        clear: () => {
            cache = [];
            garbage = [];

            //Return response
            odin.catch.return("History has been cleared!");
        },
        show: () => {
            //Return response
            odin.catch.return(cache);
        },
        add: (event) => {
            event.timestamp = new Date().getTime();
            event.humanReadable = odin.time.now();

            cache.push(event);
        },
        undo: () => {
            if(cache.length < 1){
                //Return response
                odin.catch.return("Nothing found to undo.");
                return;
            }

            //Clean garbage
            garbage = [];

            //Put to garbage
            garbage.push(cache[cache.length - 1]);

            $("#"+cache[cache.length - 1].id).remove();

            //Remove
            cache.pop();

            //Return response
            odin.cache.show();
        },
        redo: () => {
            if(garbage.length < 1){
                //Return response
                odin.catch.return("Nothing found to redo.");
                return;
            }

            //Take from garbage and add to cache
            cache.concat(garbage);

            //Create again tag
            odin.create({type: garbage[garbage.length - 1].params[0].value, id: garbage[garbage.length - 1].id, value: garbage[garbage.length - 1].params[1].value});

            //Clean the garbage
            garbage = [];

            //Return response
            odin.cache.show();
        }
    },
    time: {
        now: () => {
            const time = new Date();

            const options = {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };

            return time.toLocaleDateString('en-GB', options);
        },
        unix: () => {
            return new Date().getTime();
        }
    },
    uniqueId: () => {
        if(odin.debug.status()) {
            console.log("Generated new id: "+"odin_"+odin.time.unix());
        }

        return "odin_"+odin.time.unix();
    },
    playing_field: {
        clean: () => {
            garbage = [];
            cache = [];
            $(".playing_field").html("");

            //Return response
            odin.catch.return("Playground cleared!");
        }
    },
    make: {
        draggable: (element) => {
            let state = 'disable';

            //Make it draggable
            if($(element).is('.ui-draggable')) {

                state = 'disable';

                if($(element).is('.ui-draggable-disabled')){
                    state = 'disable';
                }
                else {
                    state = 'enable';
                }
            }
            else{
                state = 'enable';
            }

            $(element).draggable().draggable(state);

            //Add to cache
            odin.cache.add({event: 'make', id: element, params: {draggable: state}});
        },
        resizable: (element) => {
            let state = 'disable';

            //Make it draggable
            if($(element).is('.ui-resizable')) {

                state = 'disable';

                if($(element).is('.ui-resizable-disabled')){
                    state = 'disable';
                }
                else {
                    state = 'enable';
                }
            }
            else{
                state = 'enable';
            }


            $(element).resizable();

            //Add to cache
            odin.cache.add({event: 'make', id: element, params: {resizable: state}});
        },
        sortable: (element) => {

        }
    },
    toolbar: {
        render: () => {
            //Adding css for toolbar
            let css = '#odin_toolbar { display: none; background-color: #e9e9e9; width: 300px; border-radius: 8px; position: absolute; top: 20px; right: 5px; border: 1px SOLID #b9b9b9; }' +
                '#odin_toolbar_icon { display: block; position: absolute; top: 20px; right: 5px; width: 45px; height: 45px; background-color: #e9e9e9; border-radius: 8px; border: 1px SOLID #b9b9b9; }' +
                '#odin_toolbar_icon:hover { cursor: pointer; background-color: rgba(233, 233, 233, 0.7);}' +
                '#odin_toolbar_icon > img { position: absolute; margin-left: -17.5px; margin-top: -17.5px; top: 50%; left: 50%; width: 35px; height: 35px }' +
                '.odin_toolbar_header { padding: 10px; text-align: center; background-color: antiquewhite }' +
                '.odin_toolbar_header > span { font-size: 16px; font-weight: 600 }' +
                '.odin_toolbar_content { padding: 10px; overflow: hidden; overflow-y: auto }' +
                '.odin_toolbar_content > span { display: block; margin: 10px auto; font-size: 14px; font-weight: 600 }' +
                '.odin_toolbar_close {position: absolute; right: 5px; }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
            head.appendChild(style);
            style.appendChild(document.createTextNode(css));

            let toolbarIcon = "<div id='odin_toolbar_icon'>";
            toolbarIcon += "<img src='./cogs.gif'/>";
            toolbarIcon += "</div>";

            let html_toolbar = "<div id='odin_toolbar'>";
            html_toolbar += "<div class='odin_toolbar_header'><span>OdinJS Editor</span> <a href='javascript:void(0)' class='odin_toolbar_close'>Close</a></div>";
            html_toolbar += "<div class='odin_toolbar_content'>";
            html_toolbar += "<h4>Element info</h4>";
            html_toolbar += "<span>Type: </span> <div id='odin_toolbar_item_type'></div>";
            html_toolbar += "<span>ID: </span> <div id='odin_toolbar_item_id'></div>";
            html_toolbar += "<span>Classes: </span> <div id='odin_toolbar_item_classes'></div>";
            html_toolbar += "<span>Position: </span> <div id='odin_toolbar_item_position'></div>";
            html_toolbar += "<span>Size: </span> <div id='odin_toolbar_item_size'></div>";
            html_toolbar += "</div></div>";

            //Append to body
            $("body").append(toolbarIcon + html_toolbar);

            //Menu handlers
            $("#odin_toolbar_icon").on("click", () => {
                $("#odin_toolbar_icon").hide();

                $("#odin_toolbar").show();
            });

            $(".odin_toolbar_close").on("click", () => {
                $("#odin_toolbar").hide();

                $("#odin_toolbar_icon").show();
            });

            //Update toolbar
            toolbar = true;
        },
        show: () => {toolbar = true},
        hide: () => {toolbar = false}
    },
    browser: {
        refresh: () => {
            window.location = "./";
        }
    },
    helpers: {
        html: (type) => {
            let tag = null;

            if(typeof(type) !== "undefined" || type !== null){
                odin.helpers.database().map((item) => {
                    if(item.type === type || item.aliases.indexOf(type) !== -1){
                        tag = item;
                    }
                });
            }
            else{
                tag = type+" do not exists or is not supported by OdinJS!";
            }

            //Return result for the tag
            return tag;
        },
        database: () => {
            return  [
                {
                    type: "headline",
                    aliases: ["h", "headline"],
                    description: "Represents a level heading in an HTML document.",
                    resizable: false,
                    code: "<h2></h2>"
                },
                {
                    type: "paragraph",
                    aliases: ["p", "paragraph"],
                    description: "Specifies a paragraph HTML of text.",
                    resizable: false,
                    code: "<p></p>"
                },
                {
                    type: "div",
                    aliases: ["div", "block"],
                    description: "Container unit that encapsulates other page elements and divides the HTML document into sections.",
                    resizable: true,
                    code: "<div></div>"
                },
                {
                    type: "image",
                    aliases: ["img", "image"],
                    description: "Defines an image in an HTML page.",
                    resizable: true,
                    code: "<img src='./no_image.png' alt='Image text' title='Image text'/>"
                }
            ];
        }
    }
};

//Catch keyboard presses
const arrShortCut = [
    { name: 'Undo', key: "z", trigger: 'Alt', fx: 'odin.cache.undo()' },
    { name: 'Redo', key: "x", trigger: 'Alt', fx: 'odin.cache.redo()' },
    { name: 'History', key: "h", trigger: 'Control', fx: 'odin.cache.show()' },
    { name: 'Toolbar', key: "d", trigger: 'Control', fx: 'odin.toolbar.show()'},
    { name: 'Refresh', key: "r", trigger: 'Control', fx: 'odin.browser.refresh()'}
];
