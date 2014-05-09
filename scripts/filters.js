
var sirenFilters = angular.module('sirenFilters', []);

//  Help with constructing the url hash

sirenFilters.filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
  })
  .filter('prettify', function() {
    return function(obj) {
      return JSON.stringify(obj, function(key, val) {
        return (key === '$$hashKey') ? undefined : val;
      }, 2);
    };
  });

//  Strip "/" and ":" characters from a URL. 
//  TODO: Let this handle the urlEncoded hashes construced by encodeURIComponent

sirenFilters.filter('abc123', function(){
    return function(obj){
      //this doesn't really make things alphanumeric only, but it'll turn a non-urlencoded url into a valid js ID attribute :)
      return obj.replace(/\//g, "").replace(/:/g, "");
    }
  })

//  Turn common english words into their plural equivalent. 
//  Makes for prettier 1 or many lists, without doing things like "Displaying 1 word(s)". 

//  * Smart enough to turn "entry" into "entries"

sirenFilters.filter('pluralize', function() {
    return function(ordinal, noun) {
      if (ordinal == 1) {
        return ordinal + ' ' + noun;
      } else {
        var plural = noun;
        if (noun.substr(noun.length - 2) == 'us') {
          plural = plural.substr(0, plural.length - 2) + 'i';
        } else if (noun.substr(noun.length - 2) == 'ch' || noun.charAt(noun.length - 1) == 'x' || noun.charAt(noun.length - 1) == 's') {
          plural += 'es';
        } else if (noun.charAt(noun.length - 1) == 'y' && ['a','e','i','o','u'].indexOf(noun.charAt(noun.length - 2)) == -1) {
          plural = plural.substr(0, plural.length - 1) + 'ies';
        } else if (noun.substr(noun.length - 2) == 'is') {
          plural = plural.substr(0, plural.length - 2) + 'es';
        } else {
          plural += 's';
        }
        return ordinal + ' ' + plural;
      }
    };
  });

sirenFilters.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

sirenFilters.filter('nosub', function() {
  return function(items) {
    return items.replace('-subscribe', '');
  };
});

sirenFilters.filter('nodash', function() {
    return function(input) {
      return input.replace(/-/g, ' ');
    }
  });

sirenFilters.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  });

sirenFilters.filter('mapurl', function() {
  return function(project) {
        var tilesUrl = {        
          false: "alanguirand.i6m2j6kf",
          true: "alanguirand.i04decfa"
        }
        var marker = {        
          false: "pin-l+aaa",
          true: "pin-l-star+f00"
        }
     
    var url = "http://api.tiles.mapbox.com/v3/"+tilesUrl[project.online]+"/"+marker[project.online]+"("+project.location.lon+","+project.location.lat+",13)/"+project.location.lon+","+project.location.lat+",13/300x180.png";
    //console.log(url);
    return url;
  };
});

sirenFilters.filter('icon', function() {
    return function(klass) {
      //map classes to font awesome icons
      var def = "fa-cog";
      var mapping = {
        arm: "fa-wrench",
        humidity: "fa-tint",
        barometer: "fa-flask",
        temperature: "fa-cloud",
        huehub: "fa-lightbulb-o",
        system: "fa-gears",
        sound: "fa-volume-up",
        button: "fa-play"
      }
      return mapping[klass] || def;
    }
  });
