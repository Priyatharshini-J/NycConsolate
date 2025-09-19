"use strict";

// Import required modules
const express = require("express");
const cors = require('cors');
const axios = require("axios");
const catalyst = require("zcatalyst-sdk-node");


const app = express();
app.use(express.json());

// Environment variables for Zoho OAuth client
const AUTH_HOST = `https://accounts.zoho.com/oauth/v2/token`;
const CLIENTID = process.env['CLIENTID'];
const CLIENT_SECRET = process.env['CLIENT_SECRET'];
const REFRESH_TOKEN = process.env['REFRESH_TOKEN'];
const STRATUS_BUCKET_NAME = 'nyc-consolate-products';

const corsOptions = {
	origin: 'http://localhost:3001',
	credentials: true,
};

// app.use(cors(corsOptions));

app.get("/getBuyer/:id", async (req, res) => {
	try {
		const buyerId = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const buyerRawData = await axios.get(`https://www.zohoapis.com/crm/v8/Contacts/${buyerId}`, {
			params: {
				fields: "First_Name,Last_Name,Email,Mobile,Title,Buyer_Account,Mailing_Street,Mailing_City,Mailing_State,Mailing_Country,Mailing_Zip"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const buyerData = buyerRawData.data.data[0];
		const buyerAccountId = buyerData['Buyer_Account']['id']
		const buyerAccountRawData = await axios.get(`https://www.zohoapis.com/crm/v8/Accounts/${buyerAccountId}`, {
			params: {
				fields: "Account_Name,Website,Business_Description"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const buyerAccountData = buyerAccountRawData.data.data[0];
		const merged = { ...buyerData, ...buyerAccountData };
		res.status(200).json(merged);
	} catch (err) {
		console.log("Error in GET buyerDetails >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getSeller/:id", async (req, res) => {
	try {
		const sellerId = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		console.log("accessToken - ", accessToken);
		const sellerRawData = await axios.get(`https://www.zohoapis.com/crm/v8/Contacts/${sellerId}`, {
			params: {
				fields: "First_Name,Last_Name,Email,Mobile,Mailing_Street,Mailing_City,Mailing_State,Mailing_Country,Mailing_Zip,Vendor_Account"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const sellerData = sellerRawData.data.data[0];
		const sellerAccountId = sellerData['Vendor_Account']['id']
		const sellerAccountRawData = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors/${sellerAccountId}`, {
			params: {
				fields: "Vendor_Name,Website,Business_Description,Years_in_Business,Employee_Count,Business_License_Number,Tax_Identification_Number,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const sellerAccountData = sellerAccountRawData.data.data[0];
		const merged = { ...sellerData, ...sellerAccountData };
		res.status(200).json(merged);
	} catch (err) {
		console.log("Error in GET sellerDeatails >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.put("/buyer/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { firstName, lastName, email, phone, jobTitle, buyerAccountId, companyName, website, address, city, state, zipCode, country, bio } = req.body;

		const contactsData = {
			"data": [{
				id: req.params.id,
				First_Name: firstName,
				Last_Name: lastName,
				Email: email,
				Mobile: phone,
				Title: jobTitle,
				Mailing_Street: address,
				Mailing_City: city,
				Mailing_State: state,
				Mailing_Country: country,
				Mailing_Zip: zipCode,
				Business_Description: bio
			}]
		}

		const buyerData = {
			"data": [{
				id: buyerAccountId,
				Account_Name: companyName,
				Website: website,
				Business_Description: bio
			}]
		}

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()

		// Send a PUT request to Zoho CRM API to update the product by ID
		await axios.put(
			`https://www.zohoapis.com/crm/v8/Contacts/${req.params.id}`,
			contactsData,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		await axios.put(
			`https://www.zohoapis.com/crm/v8/Accounts/${buyerAccountId}`,
			buyerData,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" });
	} catch (err) {
		console.log(`Error in PUT ${req.params.id} crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.put("/seller/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { contactPerson, email, phone, companyName, website, address, city, state, zipCode, country, description, yearEstablished, employeeCount, businessLicense, taxId, vendorAccountId } = req.body;
		const [firstname, lastname] = contactPerson.split(" ");
		const contactsData = {
			"data": [{
				id: req.params.id,
				First_Name: firstname,
				Last_Name: lastname,
				Email: email,
				Mobile: phone,
				Mailing_Street: address,
				Mailing_City: city,
				Mailing_State: state,
				Mailing_Country: country,
				Mailing_Zip: zipCode,
				Business_Description: description
			}]
		}

		const vendorData = {
			"data": [{
				id: vendorAccountId,
				Vendor_Name: companyName,
				Website: website,
				Business_Description: description,
				Years_in_Business: Number(
					new Date().getFullYear() - yearEstablished
				),
				Employee_Count: employeeCount,
				Business_License_Number: businessLicense,
				Tax_Identification_Number: taxId
			}]
		}

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()

		// Send a PUT request to Zoho CRM API to update the product by ID
		await axios.put(
			`https://www.zohoapis.com/crm/v8/Contacts/${req.params.id}`,
			contactsData,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		await axios.put(
			`https://www.zohoapis.com/crm/v8/Vendors/${vendorAccountId}`,
			vendorData,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" });
	} catch (err) {
		console.log(`Error in PUT ${req.params.id} crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getProducts", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		let userManagement = catalystApp.userManagement();
		let userPromise = userManagement.getCurrentUser();
		userPromise.then(currentUser => {
			console.log(currentUser);
		});
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const products = await axios.get(`https://www.zohoapis.com/crm/v7/Products`, {
			params: {
				fields: "id,Product_Name,Product_Description,Image,Price_Range,Minimum_Order_Quantity,Vendor_Name,Product_Category"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const productsRawData = products.data.data;

		const vendors = await axios.get(`https://www.zohoapis.com/crm/v7/Vendors`, {
			params: {
				fields: "id,Average_Rating,State,Country,Vendor_Certifications,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendors.data.data;
		const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
			params: {
				fields: "Name,Vendor"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const certificationsRawData = certificates.data.data;

		const vendorMap = {};
		vendorsRawData.forEach(vendor => {
			vendorMap[vendor.id] = vendor;
		});
		const certificatesMap = {};
		certificationsRawData.forEach(cert => {
			const vendorId = cert.Vendor.id;
			if (!certificatesMap[vendorId]) {
				certificatesMap[vendorId] = [];
			}
			certificatesMap[vendorId].push(cert.Name);
		});

		const mergedProducts = productsRawData.map(product => {
			const vendorId = product.Vendor_Name.id;
			const vendorData = vendorMap[vendorId] || {};
			const vendorCertificates = certificatesMap[vendorId] || [];
			return {
				...product,
				sellerId: product.Vendor_Name.id,
				sellerName: product.Vendor_Name.name,
				sellerLocation: (vendorData.State ? vendorData.State : "") + (vendorData.Country ? ", " + vendorData.Country : ""),
				sellerRating: vendorData.Average_Rating,
				certificates: vendorCertificates,
				sellerEngScore: vendorData.Engagement_Score
			};
		});
		res.status(200).json(mergedProducts);

	} catch (err) {
		console.log("Error in GET Products >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.delete("/product/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { fileUrl } = req.body

		const stratus = catalystApp.stratus();
		const headBucketResponse = await stratus.headBucket(STRATUS_BUCKET_NAME);
		if (headBucketResponse) {
			const parts = fileUrl.split(`.com/`);
			let object = parts[1];
			const bucket = stratus.bucket(STRATUS_BUCKET_NAME);
			try {
				await bucket.deleteObject(object);
			} catch (error) {
				console.log("error in delete object- ", error);
			}
		}
		// Delete the product from Zoho CRM using the product ID from URL
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const response = await axios.delete(
			`https://www.zohoapis.com/crm/v8/Products/${req.params.id}`,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" });
	} catch (err) {
		console.log(`Error in DELETE ${req.params.id} crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getVendors", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const vendors = await axios.get(`https://www.zohoapis.com/crm/v7/Vendors`, {
			params: {
				fields: "id,Vendor_Name,Business_Description,Average_Rating,Rating_Count,State,Country,Years_in_Business,Employee_Count,Vendor_Certifications,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendors.data.data;
		const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
			params: {
				fields: "Name,Vendor"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const certificationsRawData = certificates.data.data;
		const certificatesMap = {};
		certificationsRawData.forEach(cert => {
			const vendorId = cert.Vendor.id;
			if (!certificatesMap[vendorId]) {
				certificatesMap[vendorId] = [];
			}
			certificatesMap[vendorId].push(cert.Name);
		});

		const mergedVendors = vendorsRawData.map(v => ({
			...v,
			certifications: certificatesMap[v.id] || []
		}));

		res.status(200).json(mergedVendors);
	} catch (err) {
		console.log("Error in GET Vendors >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getBuyerDeals/:id", async (req, res) => {
	try {
		const buyerID = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const buyerDeals = await axios.get(`https://www.zohoapis.com/crm/v8/Deals/search?criteria=Account_Name:equals:${buyerID}`, {
			params: {
				fields: "id,Deal_Name,Vendor_Name,Product_Name,Stage,Deal_Initiated_Date,Closing_Date,Estimated_Deal_Range"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const buyerDealsData = buyerDeals.data.data;
		res.status(200).json(buyerDealsData);
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getSellerProducts/:id", async (req, res) => {
	try {
		const SellerID = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const sellerProducts = await axios.get(`https://www.zohoapis.com/crm/v8/Products/search?criteria=Vendor_Name:equals:${SellerID}`, {
			params: {
				fields: "id,Product_Name,Product_Description,Product_Category,Price_Range,Minimum_Order_Quantity,Image"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const sellerProductsData = sellerProducts.data.data;
		res.status(200).json(sellerProductsData);
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getSellerCertifications/:id", async (req, res) => {
	try {
		const SellerID = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const sellerCertifications = await axios.get(`https://www.zohoapis.com/crm/v8/Certifications/search?criteria=Vendor:equals:${SellerID}`, {
			params: {
				fields: "id,Certification_number,Name,Issued_Date,Expiry_Date,Issuer"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const sellerCertificationsData = sellerCertifications.data.data;
		res.status(200).json(sellerCertificationsData);
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.post("/postSellerCertifications/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { certificationNo, name, issuer, issueDate, expiryDate } = req.body;
		const payload = {
			"data": [{
				Name: name,
				Certification_number: certificationNo,
				Issuer: issuer,
				Issued_Date: issueDate,
				Expiry_Date: expiryDate,
				Vendor: { "id": req.params.id }
			}]
		}
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const response = await axios.post(`https://www.zohoapis.com/crm/v8/Certifications`, payload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json"
				}
			});
		res.status(200).json({ "code": response.data.data[0].code });
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.put("/putSellerCertifications/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { certificationNo, name, issuer, issueDate, expiryDate } = req.body;
		const payload = {
			"data": [{
				Name: name,
				Certification_number: certificationNo,
				Issuer: issuer,
				Issued_Date: issueDate,
				Expiry_Date: expiryDate,
				id: req.params.id
			}]
		}
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const response = await axios.put(`https://www.zohoapis.com/crm/v8/Certifications/${req.params.id}`, payload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json"
				}
			});
		res.status(200).json({ "code": response.data.data[0].code });
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.delete("/deleteSellerCertifications/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const response = await axios.delete(`https://www.zohoapis.com/crm/v8/Certifications/${req.params.id}`,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json"
				}
			});
		res.status(200).json({ "code": response.data.data[0].code });
	} catch (err) {
		console.log("Error in GET buyerDealsData >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/getSellerDeals/:id", async (req, res) => {
	try {
		const sellerID = req.params.id;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const sellerDeals = await axios.get(`https://www.zohoapis.com/crm/v8/Deals/search?criteria=Vendor_Name:equals:${sellerID}`, {
			params: {
				fields: "id,Deal_Name,Account_Name,Product_Name,Stage,Deal_Initiated_Date,Closing_Date,Estimated_Deal_Range,Quantity"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const sellerDealsData = sellerDeals.data.data;
		res.status(200).json(sellerDealsData);
	} catch (err) {
		console.log("Error in GET sellerDeals >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.post("/postDeal", async (req, res) => {
	try {
		const { buyerAccountId, name, productId, sellerId, closingDate } = req.body;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const dealData = {
			Account_Name: { id: buyerAccountId },
			Deal_Name: name,
			Vendor_Name: { id: sellerId },
			Closing_Date: closingDate,
			Stage: "Seller Contacted",
			Quantity: 0
		};
		if (productId) {
			dealData.Product_Name = { id: productId };
		}
		const payload = {
			data: [dealData]
		};
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const response = await axios.post(`https://www.zohoapis.com/crm/v8/Deals`, payload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json"
				}
			});
		res.status(200).json({ "code": response.data.data[0].code });
	} catch (err) {
		console.log("Error in posting buyerDeals >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.put("/deal/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { stage, quantity } = req.body;

		let constructedData;

		if (stage !== undefined && stage !== null) {
			constructedData = {
				data: [{
					id: req.params.id,
					Stage: stage
				}]
			};
		} else if (quantity !== undefined && quantity !== null) {
			constructedData = {
				data: [{
					id: req.params.id,
					Quantity: quantity
				}]
			};
		}

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()

		// Send a PUT request to Zoho CRM API to update the product by ID
		await axios.put(
			`https://www.zohoapis.com/crm/v8/Deals/${req.params.id}`,
			constructedData,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" });
	} catch (err) {
		console.log(`Error in PUT ${req.params.id} crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.post("/postProduct", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { productName, description, category, minPrice, maxPrice, minOrderQuantity, fileUrl, vendorId, hsCode, itcHsCode, tax } = req.body;
		const payload = {
			"data": [
				{
					Product_Name: productName,
					Product_Description: description,
					Product_Category: category,
					Price_Min: minPrice,
					Price_Max: maxPrice,
					Minimum_Order_Quantity: minOrderQuantity,
					Image: fileUrl,
					HS_Code: hsCode,
					ITC_HS_Code: itcHsCode,
					Vendor_Name: { "id": vendorId }
				}
			]
		};

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()

		const response = await axios.post(
			`https://www.zohoapis.com/crm/v8/Products`,
			payload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": response.data.data[0].code })
	} catch (err) {
		console.log(`Error in POST crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.put("/putProduct/:id", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { name, description, category, priceRange, mod } = req.body;
		const prices = priceRange.match(/\d+(\.\d+)?/g);

		const minPrice = parseFloat(prices[0]);
		const maxPrice = parseFloat(prices[1]);
		const data = {
			"data": [{
				id: req.params.id,
				Product_Name: name,
				Product_Description: description,
				Product_Category: category,
				Price_Min: minPrice,
				Price_Max: maxPrice,
				Minimum_Order_Quantity: mod,
			}]
		}

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		await axios.put(
			`https://www.zohoapis.com/crm/v8/Products/${req.params.id}`,
			data,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" });
	} catch (err) {
		console.log(`Error in PUT ${req.params.id} crmProduct >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.post("/postFeedback", async (req, res) => {
	try {
		const catalystApp = catalyst.initialize(req);
		const { dealId, vendorId, rating, comments } = req.body;
		const payload = {
			"data": [
				{
					id: dealId,
					Buyer_Rating: rating.toString(),
					Buyer_Comment: comments
				}
			]
		};

		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()

		await axios.put(
			`https://www.zohoapis.com/crm/v8/Deals/${dealId}`,
			payload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		const vendor = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors/${vendorId}`, {
			params: {
				fields: "Rating_Count,Rating_Total_Points"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendor.data.data[0];
		const total_count = vendorsRawData.Rating_Count + 1;
		const total_points = Number(vendorsRawData.Rating_Total_Points) + Number(rating);
		const average = parseFloat(total_points / total_count).toPrecision(2);
		const ratingPayload = {
			"data": [
				{
					id: vendorId,
					Rating_Count: total_count,
					Rating_Total_Points: total_points,
					Average_Rating: average.toString()
				}
			]
		};

		await axios.put(
			`https://www.zohoapis.com/crm/v8/Vendors/${vendorId}`,
			ratingPayload,
			{
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		);
		res.status(200).json({ "code": "SUCCESS" })
	} catch (err) {
		console.log(`Error in POST feedback >>> ` + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/search/:type/:word", async (req, res) => {
	try {
		const { type, word } = req.params;
		let params = {
			fields: "id,Product_Name,Product_Description,Image,Price_Range,Minimum_Order_Quantity,Vendor_Name,Product_Category"
		};

		if (type === "category") {
			params.criteria = `Product_Category:equals:${word}`;
		} else if (type === "word") {
			params.word = word;
		} else {
			return res.status(400).json({ error: "Invalid search type" });
		}
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const products = await axios.get(`https://www.zohoapis.com/crm/v8/Products/search`, {
			params,
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const productsRawData = products.data.data;
		if (productsRawData) {
			const vendors = await axios.get(`https://www.zohoapis.com/crm/v7/Vendors`, {
				params: {
					fields: "id,Average_Rating,State,Country,Vendor_Certifications,Engagement_Score"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const vendorsRawData = vendors.data.data;
			const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
				params: {
					fields: "Name,Vendor"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const certificationsRawData = certificates.data.data;

			const vendorMap = {};
			vendorsRawData.forEach(vendor => {
				vendorMap[vendor.id] = vendor;
			});
			const certificatesMap = {};
			certificationsRawData.forEach(cert => {
				const vendorId = cert.Vendor.id;
				if (!certificatesMap[vendorId]) {
					certificatesMap[vendorId] = [];
				}
				certificatesMap[vendorId].push(cert.Name);
			});

			const mergedProducts = productsRawData.map(product => {
				const vendorId = product.Vendor_Name.id;
				const vendorData = vendorMap[vendorId] || {};
				const vendorCertificates = certificatesMap[vendorId] || [];
				return {
					...product,
					sellerId: product.Vendor_Name.id,
					sellerName: product.Vendor_Name.name,
					sellerLocation: (vendorData.State ? vendorData.State : "") + (vendorData.Country ? ", " + vendorData.Country : ""),
					sellerRating: vendorData.Average_Rating,
					certificates: vendorCertificates,
					sellerEngScore: vendorData.Engagement_Score
				};
			});
			res.status(200).json(mergedProducts);
		} else {
			res.status(200).json([]);
		}

	} catch (err) {
		console.log("Error in GET buyerDetails >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/searchRating/:rating", async (req, res) => {
	try {
		const rating = req.params.rating;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const vendorsData = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors/search`, {
			params: {
				criteria: `Average_Rating:starts_with:${rating}`,
				fields: "id,Vendor_Name,Business_Description,Average_Rating,Rating_Count,State,Country,Years_in_Business,Employee_Count,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendorsData.data.data
		if (vendorsRawData) {
			const products = await axios.get(`https://www.zohoapis.com/crm/v7/Products`, {
				params: {
					fields: "id,Product_Name,Product_Description,Image,Price_Range,Minimum_Order_Quantity,Vendor_Name,Product_Category"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const productsRawData = products.data.data;
			const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
				params: {
					fields: "Name,Vendor"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const certificationsRawData = certificates.data.data;
			const vendorWiseData = vendorsRawData.map(vendor => {
				// Get all products for this vendor, enriched with vendor info
				const vendorProducts = productsRawData
					.filter(prod => prod.Vendor_Name.id === vendor.id)
					.map(prod => {
						const vendorCertificates = certificationsRawData
							.filter(cert => cert.Vendor.id === vendor.id)
							.map(cert => cert.Name);

						return {
							...prod,
							sellerId: prod.Vendor_Name.id,
							sellerName: prod.Vendor_Name.name,
							sellerLocation: (vendor.State ? vendor.State : "") + (vendor.Country ? ", " + vendor.Country : ""),
							sellerRating: vendor.Average_Rating,
							certificates: vendorCertificates,
							sellerEngScore: vendor.Engagement_Score
						};

					});

				return {
					vendorProducts
				};
			});
			res.status(200).send(vendorWiseData[0].vendorProducts);
		} else {
			res.status(200).send([]);
		}

	} catch (err) {
		console.log("Error in Search Details >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/searchSellers/:word", async (req, res) => {
	try {
		const word = req.params.word;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const vendors = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors/search`, {
			params: {
				word,
				fields: "id,Vendor_Name,Business_Description,Average_Rating,Rating_Count,State,Country,Years_in_Business,Employee_Count,Vendor_Certifications,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendors.data.data;
		const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
			params: {
				fields: "Name,Vendor"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const certificationsRawData = certificates.data.data;
		const certificatesMap = {};
		certificationsRawData.forEach(cert => {
			const vendorId = cert.Vendor.id;
			if (!certificatesMap[vendorId]) {
				certificatesMap[vendorId] = [];
			}
			certificatesMap[vendorId].push(cert.Name);
		});

		const mergedVendors = vendorsRawData.map(v => ({
			...v,
			certifications: certificatesMap[v.id] || []
		}));

		res.status(200).json(mergedVendors);

	} catch (err) {
		console.log("Error in GET buyerDetails >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/searchSellerRating/:rating", async (req, res) => {
	try {
		const rating = req.params.rating;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const vendorsData = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors/search`, {
			params: {
				criteria: `Average_Rating:starts_with:${rating}`,
				fields: "id,Vendor_Name,Business_Description,Average_Rating,Rating_Count,State,Country,Years_in_Business,Employee_Count,Engagement_Score"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const vendorsRawData = vendorsData.data.data
		if (vendorsRawData) {
			const certificates = await axios.get(`https://www.zohoapis.com/crm/v7/Certifications`, {
				params: {
					fields: "Name,Vendor"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const certificationsRawData = certificates.data.data;
			const certificatesMap = {};
			certificationsRawData.forEach(cert => {
				const vendorId = cert.Vendor.id;
				if (!certificatesMap[vendorId]) {
					certificatesMap[vendorId] = [];
				}
				certificatesMap[vendorId].push(cert.Name);
			});

			const mergedVendors = vendorsRawData.map(v => ({
				...v,
				certifications: certificatesMap[v.id] || []
			}));

			res.status(200).json(mergedVendors);
		} else {
			res.status(200).send([]);
		}
	} catch (err) {
		console.log("Error in Search Details >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});

app.get("/searchSellerCertification/:certificate", async (req, res) => {
	try {
		const certificate = req.params.certificate;
		const catalystApp = catalyst.initialize(req);
		const credentials = {
			crm_connector: {
				client_id: CLIENTID,
				client_secret: CLIENT_SECRET,
				auth_url: AUTH_HOST,
				refresh_url: AUTH_HOST,
				refresh_token: REFRESH_TOKEN
			}
		}
		const accessToken = await catalystApp.connection(credentials).getConnector('crm_connector').getAccessToken()
		const certificates = await axios.get(`https://www.zohoapis.com/crm/v8/Certifications/search`, {
			params: {
				criteria: `Name:starts_with:${certificate}`,
				fields: "Name,Vendor"
			},
			headers: {
				Authorization: `Zoho-oauthtoken ${accessToken}`
			}
		});
		const certificationsRawData = certificates.data.data;

		if (certificationsRawData) {
			const vendorsData = await axios.get(`https://www.zohoapis.com/crm/v8/Vendors`, {
				params: {
					fields: "id,Vendor_Name,Business_Description,Average_Rating,Rating_Count,State,Country,Years_in_Business,Employee_Count,Engagement_Score"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const vendorsRawData = vendorsData.data.data

			const allCertData = await axios.get(`https://www.zohoapis.com/crm/v8/Certifications`, {
				params: {
					fields: "Name,Vendor"
				},
				headers: {
					Authorization: `Zoho-oauthtoken ${accessToken}`
				}
			});
			const allCertDataData = allCertData.data.data
			const searchedVendorIds = new Set(certificationsRawData.map(cert => cert.Vendor.id));
			const certificatesMap = allCertDataData.reduce((acc, cert) => {
				const vendorId = cert.Vendor.id;
				if (!acc[vendorId]) acc[vendorId] = [];
				acc[vendorId].push(cert.Name);
				return acc;
			}, {});
			const result = vendorsRawData
				.filter(v => searchedVendorIds.has(v.id))
				.map(v => ({
					...v,
					certifications: certificatesMap[v.id] || []
				}));
			res.status(200).send(result);

		} else {
			res.status(200).send([]);
		}
	} catch (err) {
		console.log("Error in Search Details >>> " + err);
		res.status(500).send({
			message: "Internal Server Error. Please try again after sometime.",
			error: err
		});
	}
});







module.exports = app;


