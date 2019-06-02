let cache = [];
let garbage = [];
let newItem = [];
let debug = false;
let toolbar = false;
const version = "1.0";

odin = {
    initialize: () => {
        cache = [];
        garbage = [];
        newItem = [];
        debug = false;

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

        //Toolbar
        odin.toolbar.render();

        console.log("Running OdinJS v"+version);
    },
    debug: {
        enable: () => { debug = true },
        disable: () => { debug = false },
        status: () => { return debug }
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

        //Creating switch to returns existing types
        switch(type){
            //Headline
            case "headline":
            case "h":
                newItem.push("<h2 id='"+id+"'>"+value+"</h2>");
                break;

            //Paragraph
            case "paragraph":
            case "p":
                newItem.push("<p id='"+id+"'>"+value+"</p>");
                break;

            default:
                newItem.push("<div id='"+id+"'>"+value+"</div>");
        }
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
            }

            //Put to garbage
            garbage.push(cache[cache.length - 1]);

            //Remove
            cache.pop();

            //Return response
            odin.cache.show();
        },
        redo: () => {
            if(garbage.length < 1){
                //Return response
                odin.catch.return("Nothing found to redo.");
            }

            //Take from garbage and add to cache
            cache = [...cache, ...garbage];

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

        },
        sortable: (element) => {

        }
    },
    toolbar: {
        render: () => {
            console.log("Rendering OdinJS toolbar...");
        },
        show: () => {toolbar = true},
        hide: () => {toolbar = false}
    },
    browser: {
        refresh: () => {
            window.location = "./";
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

//Run odin
odin.initialize();