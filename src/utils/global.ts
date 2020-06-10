/**
 * Validate object
 * 
 * @private
 * @param obj - object for validation
 * @param it - internal flag
 */
export const validator = (obj: any, it: boolean = true) => {
	switch(typeof(obj)){
		case "boolean":
			return true
		case "number":
			return true
		case "string":
			return true
		case "object":
			if(obj === null)
				return true
			if(obj.__proto__ === ({} as any ).__proto__){
				for (const key in obj)
				if(validator(obj[key]) === false)
					return false
				return true
			}
			if(it && (obj.__proto__ === ([] as any).__proto__)){
				for (const key of obj)
				if(validator(key) === false)
					return false
				return true		
			}
			return false
		default:
			return false
	}
}