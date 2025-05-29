const express = require('express');
const router = express.Router();
const axios = require('axios');



const SHIPROCKET_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjY2OTYxNDAsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzQ5MjY5MDc3LCJqdGkiOiJ3ZE12bGt2QTEzdHVqblZWIiwiaWF0IjoxNzQ4NDA1MDc3LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTc0ODQwNTA3NywiY2lkIjo0NTY4NDczLCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6Im1pbmlzIn0.x0J04bvTlb9q4D0T51vtuulC3C1tfxwN5jIBTvdJ584';
// Route: POST /api/shiprocket-login

router.post('/api/shiprocket-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/auth/login',
            {
                email: email,
                password: password
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(500).json({
            error: 'Shiprocket login failed',
            details: error.response?.data || error.message
        });
    }
});

// router.post('/api/create-order', async (req, res) => {
//   try {
//     const orderData = req.body;

//     // Log the incoming order data for debugging
//     console.log('Incoming Shiprocket Order Data:', JSON.stringify(orderData, null, 2));

//     const config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': SHIPROCKET_TOKEN
//       },
//       data: JSON.stringify(orderData)
//     };

//     const response = await axios(config);

//     // Log the successful Shiprocket API response
//     console.log('Shiprocket API Response:', JSON.stringify(response.data, null, 2));

//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Order creation failed:', error.message);

//     // Log the detailed error if available
//     if (error.response) {
//       console.error('Shiprocket API Error Response:', JSON.stringify({
//         status: error.response.status,
//         data: error.response.data,
//         headers: error.response.headers
//       }, null, 2));
//     } else {
//       console.error('Error details:', error);
//     }

//     res.status(500).json({
//       error: 'Shiprocket order creation failed',
//       details: error.response?.data || error.message
//     });
//   }
// });

// router.post('/api/Shipment', async (req, res) => {
//     try {
//         const { shipment_id, courier_id } = req.body;

//         const data = JSON.stringify({
//             shipment_id,
//             courier_id
//         });

//         const config = {
//             method: 'post',
//             maxBodyLength: Infinity,
//             url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': SHIPROCKET_TOKEN
//             },
//             data
//         };

//         const response = await axios(config);
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error('AWB Assignment Error:', error.message);
//         res.status(500).json({
//             error: 'Failed to assign AWB',
//             details: error.response?.data || error.message
//         });
//     }
// });

// router.post('/api/tracking-order', async (req, res) => {
//     try {
//         const { awbs } = req.body;

//         const data = JSON.stringify({
//             awbs
//         });

//         const config = {
//             method: 'post',
//             maxBodyLength: Infinity,
//             url: 'https://apiv2.shiprocket.in/v1/external/courier/track/awbs',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': SHIPROCKET_TOKEN
//             },
//             data
//         };

//         const response = await axios(config);
//         res.status(200).json(response.data);
//     } catch (error) {
//         console.error('Tracking Error:', error.message);
//         res.status(500).json({
//             error: 'Failed to track AWBs',
//             details: error.response?.data || error.message
//         });
//     }
// });


router.post('/api/create-order', async (req, res) => {
    try {
        const orderData = req.body;

        // 1. Create Order
        const createOrderConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SHIPROCKET_TOKEN
            },
            data: JSON.stringify(orderData)
        };

        const createOrderResponse = await axios(createOrderConfig);
        const orderResult = createOrderResponse.data;

        console.log('✅ Order Created:', JSON.stringify(orderResult, null, 2));

        const shipmentId = orderResult.shipment_id;

        if (!shipmentId) {
            throw new Error('No shipment_id found in create order response');
        }

        // 2. Assign AWB (even if order is "CANCELED", attempt assignment)
        const assignAWBConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SHIPROCKET_TOKEN
            },
            data: JSON.stringify({
                shipment_id: shipmentId
                // Not passing courier_id since it's often selected automatically by Shiprocket
            })
        };

        const assignAWBResponse = await axios(assignAWBConfig);
        const awbResult = assignAWBResponse.data;

        console.log('✅ AWB Assigned:', JSON.stringify(awbResult, null, 2));

        const awbCode = awbResult?.response?.data?.awb_code;

        if (!awbCode) {
            throw new Error('No awb_code found in AWB assignment response');
        }

        // 3. Track Shipment
        const trackingConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/courier/track/awbs',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SHIPROCKET_TOKEN
            },
            data: JSON.stringify({
                awbs: [awbCode]
            })
        };

        const trackingResponse = await axios(trackingConfig);
        const trackingResult = trackingResponse.data;

        console.log('📦 Tracking Info:', JSON.stringify(trackingResult, null, 2));

        // Final Response
        res.status(200).json({
            order: orderResult,
            awb: awbResult,
            tracking: trackingResult
        });

    } catch (error) {
        console.error('❌ Error in order workflow:', error.message);

        res.status(500).json({
            error: 'Shiprocket order workflow failed',
            details: error.response?.data || error.message
        });
    }
});



router.post('/api/cancel-order', async (req, res) => {
    try {
        const { ids } = req.body;

        const data = JSON.stringify({ ids });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/orders/cancel',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SHIPROCKET_TOKEN
            },
            data
        };

        const response = await axios(config);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Cancel order error:', error.message);
        res.status(500).json({
            error: 'Failed to cancel order(s)',
            details: error.response?.data || error.message
        });
    }
});


module.exports = router;
