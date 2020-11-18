const express = require('express');
const verifyToken = require('../Middleware/verifyToken');
const ApprovalRoute = require('../models/ApprovalRoute');
const Scheme = require('../models/Scheme');
const User = require('../models/User');

const router = express.Router();

/*GETS*/

// GET ALL APPROVAL ROUTES
// I: -
// O: all approval routes names, status and sheme names
// E: 408, 401, 400
router.get('/', verifyToken, async (req, res) => {
	try {
		const approvalRoute = await ApprovalRoute.find(
			{},
			{ _id: 0, name: 1, isActive: 1, schemeId: 1 }
		);
		let approvalRoutesWithSchemeNames = [];
		for (let key in approvalRoute) {
			if (approvalRoute.hasOwnProperty(key)) {
				appRoute = approvalRoute[key];
				let schemeName = await Scheme.findOne(
					{ _id: appRoute.schemeId },
					{ _id: 0, name: 1 }
				);
				if (schemeName == null) {
					res.status(400).json({ message: 'Specified scheme not found' });
					return;
				}
				approvalRoutesWithSchemeNames.push({
					name: appRoute.name,
					isActive: appRoute.isActive,
					schemeName: schemeName.name
				});
			}
		}
		res.json(approvalRoutesWithSchemeNames);
	} catch (error) {
		res.status(408).json({ message: error });
	}
});

// Gets approval route by Id
router.get('/:approvalRouteId', verifyToken, async (req, res) => {
	try {
		const approvalRoute = await ApprovalRoute.findById(
			req.params.approvalRouteId
		);
		res.json(approvalRoute);
	} catch (error) {
		res.status(408).json({ message: error });
	}
});

/*POSTS*/

// CREATE NEW APPROVAL ROUTE
// I:
/*
	name: String,
	schemeName: String,
	authors: [ username: String ],
	approvers: [ username: String ],
	requiredApprovals: Number,
	requiredRejections: Number
*/
// O: Saved approval route name
// E: 408, 401, 400
router.post('/', verifyToken, async (req, res) => {
	try {
		const schemeId = await Scheme.findOne(
			{ name: req.body.schemeName, isActive: true },
			{ _id: 1 }
		);
		if (schemeId == null) {
			res.status(400).json({ message: 'Specified scheme not found' });
			return;
		}
		if (
			req.body.requiredApprovals > req.body.approvers.length ||
			req.body.requiredRejections > req.body.approvers.length
		) {
			res.status(400).json({
				message: 'Invalid amount of required approvals or rejections'
			});
			return;
		}
		let authorIds = [];
		for (let key in req.body.authors) {
			if (req.body.authors.hasOwnProperty(key)) {
				author = req.body.authors[key];
				let authorId = await User.findOne(
					{ username: author.username },
					{ _id: 1 }
				);
				if (authorId == null) {
					res.status(400).json({ message: 'Specified author not found' });
					return;
				}
				authorIds.push({ userId: authorId._id });
			}
		}
		let approverIds = [];
		for (let key in req.body.approvers) {
			if (req.body.approvers.hasOwnProperty(key)) {
				approver = req.body.approvers[key];
				let approverId = await User.findOne(
					{ username: approver.username },
					{ _id: 1 }
				);
				if (approverId == null) {
					res.status(400).json({ message: 'Specified approver not found' });
					return;
				}
				approverIds.push({ userId: approverId._id });
			}
		}
		const approvalRoute = new ApprovalRoute({
			name: req.body.name,
			schemeId: schemeId._id,
			authors: authorIds,
			approvers: approverIds,
			requiredApprovals: req.body.requiredApprovals,
			requiredRejections: req.body.requiredRejections
		});
		const savedApprovalRoute = await approvalRoute.save();
		res.json({ name: savedApprovalRoute.name });
	} catch (error) {
		if (error.message == 'Validation failed') {
			res.status(400).json({ message: 'Approval route name is unavailable' });
		} else {
			res.status(408).json({ message: error });
		}
	}
});

module.exports = router;
