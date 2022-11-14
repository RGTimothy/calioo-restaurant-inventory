const Response = require('../common/Response')
const Dynamo = require('../common/Dynamo')
const tableName = process.env.tableName

exports.handler = async event => {
	console.log('event', event)
	
	const req = JSON.parse(event.body)

	if (!req.discount) {
		return Response._400({message: 'Discount is required'})
	}

	let category = req.category || null
	let discount = req.discount
	let updated = []
	let items

	if (category == null) {
		// scan and update all items
		items = await Dynamo.scan({
			tableName
		})
	} else {
		// update items with the same category
		items = await Dynamo.scan({
			tableName,
			filterAttributeKey: 'category',
			filterAttributeValue: category
		})
	}

	for (var i = 0; i < items.length; i++) {
		const res = await Dynamo.update({
			tableName,
			restaurant_id: items[i].restaurant_id,
			inventory_id: items[i].inventory_id,
			updateKey: 'discount',
			updateValue: discount
		})

		updated.push(res)
	}

	// items.forEach(element => {
	// 	const res = await Dynamo.update({
	// 		tableName,
	// 		restaurant_id: element.restaurant_id,
	// 		inventory_id: element.inventory_id,
	// 		updateKey: 'discount',
	// 		updateValue: discount
	// 	})

	// 	updated.push(res)
	// })

	return Response._200({updated})
}