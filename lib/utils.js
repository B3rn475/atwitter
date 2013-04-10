/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
 
exports.merge = function (obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { 
      if (!obj3[attrname])
      {
         obj3[attrname] = obj2[attrname];
      }
      else
      {
         if (typeof(obj3[attrname]) == 'object' && typeof(obj2[attrname]) == 'object')
         {
            obj3[attrname] = exports.merge(obj3[attrname],obj2[attrname]);
         }
         else
         {
            obj3[attrname] = obj2[attrname];
         }
      }
    }
    return obj3;
}

exports.urlSerialize = function(obj)
{
   var str = "";
   for (var key in obj) {
       str += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]) + "&";
   }
   return str.substr(0,str.length-1);
}
