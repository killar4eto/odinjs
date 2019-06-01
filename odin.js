let cache = [];
let garbage = [];
let newItem = [];

let iShortCutControlKey = "Control";
let iShortCutAltKey = "Alt";
let bIsControlKeyActived = false;
let bIsAltKeyActived = false;

$(document).keyup(function(e) {
    if (e.key === iShortCutControlKey) bIsControlKeyActived = false;
    if (e.key === iShortCutAltKey) bIsAltKeyActived = false;
}).keydown(function(e) {
    if (e.key === iShortCutControlKey) bIsControlKeyActived = true;
    if (e.key === iShortCutAltKey) bIsAltKeyActived = true;

    if (bIsControlKeyActived|| bIsAltKeyActived) {
        $.each(arrShortCut, function(i) {
            if (arrShortCut[i].key === e.key) {
                eval(arrShortCut[i].fx);
                return;
            }
        });
    }
});

odin = {

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

            console.log(type + " has been created.");
            return type + " has been created.";
        }
        else{
            console.log("WRONG PARAMS!");
            return "WRONG PARAMS!";
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

            return "History has been cleared!";
        },
        show: () => {
            return cache;
        },
        add: (event) => {
            event.timestamp = new Date().getTime();
            event.humanReadable = odin.time.now();

            cache.push(event);
        },
        undo: () => {
            if(cache.length < 1){
                console.log("Nothing found to undo.");
                return "Nothing found to undo.";
            }

            //Put to garbage
            garbage.push(cache[cache.length - 1]);

            //Remove
            cache.pop();

            console.log(odin.cache.show());
            return odin.cache.show();
        },
        redo: () => {
            if(garbage.length < 1){
                console.log("Nothing found to redo.");
                return "Nothing found to redo.";
            }

            //Take from garbage and add to cache
            cache = [...cache, ...garbage];

            //Clean the garbage
            garbage = [];

            console.log(odin.cache.show());
            return odin.cache.show();
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
        return "odin_"+odin.time.unix();
    },
    playing_field: {
        clean: () => {
            $(".playing_field").html("");
        }
    }
};

//Catch keyboard presses
const arrShortCut = [
    { name: 'Undo', key: "z", fx: 'odin.cache.undo()' },
    { name: 'Redo', key: "x", fx: 'odin.cache.redo()' }
];