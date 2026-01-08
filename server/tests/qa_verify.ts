
import axios from 'axios';

const API_URL = 'http://localhost:3000';
let authToken = '';
let projectId = '';
let deliverableId = '';
let clientToken = '';

async function runTests() {
    console.log('--- STARTING QA AUTOMATION ---');

    // 1. Auth: Register
    try {
        const email = `test_${Date.now()}@qa.com`;
        console.log(`\n1. Testing Registration (${email})...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password: 'password123'
        });
        authToken = regRes.data.token;
        console.log('   PASS: Registration successful');
    } catch (e: any) {
        console.error('   FAIL: Registration', e.message);
        return;
    }

    // 2. Project: Create
    try {
        console.log('\n2. Testing Project Creation...');
        const projRes = await axios.post(`${API_URL}/projects`, {
            name: 'QA Project',
            clientEmail: 'client@qa.com'
        }, { headers: { Authorization: `Bearer ${authToken}` } });
        projectId = projRes.data.id;
        clientToken = projRes.data.clientAccessParam;
        console.log('   PASS: Project created. ID:', projectId);
        console.log('   PASS: Client Token:', clientToken);
    } catch (e: any) {
        console.error('   FAIL: Project Creation', e.message);
        return;
    }

    // 2.5 Scope Management
    try {
        console.log('\n2.5 Testing Scope Management...');
        // Create Scope
        const scopeRes = await axios.post(`${API_URL}/projects/${projectId}/scopes`, {
            content: 'Full Website Redesign Scope v1'
        }, { headers: { Authorization: `Bearer ${authToken}` } });
        const scopeId = scopeRes.data.id;
        console.log('   PASS: Scope v1 created. ID:', scopeId);

        // Lock Scope
        await axios.patch(`${API_URL}/projects/${projectId}/scopes/${scopeId}/lock`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('   PASS: Scope locked.');
    } catch (e: any) {
        console.error('   FAIL: Scope Management', e.message);
    }

    // 3. Deliverable: Upload
    try {
        console.log('\n3. Testing Deliverable Upload (v1)...');
        const delRes = await axios.post(`${API_URL}/deliverables`, {
            projectId,
            fileUrl: 'https://example.com/file.pdf',
            notes: 'First Draft'
        }, { headers: { Authorization: `Bearer ${authToken}` } });
        deliverableId = delRes.data.id;
        if (delRes.data.version !== 1) throw new Error('Version mismatch');
        console.log('   PASS: Deliverable v1 created. ID:', deliverableId);
    } catch (e: any) {
        console.error('   FAIL: Deliverable Upload', e.message);
        return;
    }

    // 4. Client Access (Public)
    try {
        console.log('\n4. Testing Client Access Link...');
        const clientRes = await axios.get(`${API_URL}/client/access/${clientToken}`);
        if (clientRes.data.id !== projectId) throw new Error('Project ID mismatch');
        console.log('   PASS: Client access verified.');
    } catch (e: any) {
        console.error('   FAIL: Client Access', e.message);
    }

    // 5. Client Approval
    try {
        console.log('\n5. Testing Client Approval...');
        const appRes = await axios.post(`${API_URL}/client/deliverables/${deliverableId}/approve`, {
            action: 'APPROVE',
            comments: 'Looks good!'
        }, { headers: { 'x-client-token': clientToken } });
        console.log('   PASS: Approval successful.');
        console.log('   Audit Log ID:', appRes.data.id);
    } catch (e: any) {
        console.error('   FAIL: Client Approval', e.message);
    }

    // 6. Verify Invoice (Expected PASS)
    try {
        console.log('\n6. Checking for Invoice implementation...');
        const projRes = await axios.get(`${API_URL}/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const invoices = projRes.data.invoices || [];
        if (invoices.length > 0) {
            console.log('   PASS: Invoice generated successfully! ID:', invoices[0].id);
        } else {
            throw new Error('Invoice NOT found');
        }
    } catch (e: any) {
        console.error('   FAIL: Invoice Verification', e.message);
    }

    console.log('\n--- QA COMPLETE ---');
}

runTests();
