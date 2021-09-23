
async function postFormDataAsJson({ url, formData }) {
	const plainFormData = Object.fromEntries(formData.entries());
	const formDataJsonString = JSON.stringify(plainFormData);
	console.log(formDataJsonString);

	const fetchOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			credentials: 'same-origin',			
		},
		body: formDataJsonString
	};

	const response = await fetch(url, fetchOptions);
	const res_data = await response.json();

	console.log(response.status);
	
	return [response.status, res_data];
}


async function handleFormSubmit(event) {
	event.preventDefault();

	const form = event.currentTarget;

	console.log(form);

	const url = form.action;

	try {
		const formData = new FormData(form);

		const [statusCode, json] = await postFormDataAsJson({ url, formData });		

		if (statusCode == 200) { 
			window.location.assign('/'); 
		}	else {
			const alert_msg = document.getElementById('alert-msg');
			alert_msg.innerText = json.message;
		}

	} catch (error) {
		console.error(error);
	}
}

const login_form = document.getElementById("login-form");
login_form.addEventListener("submit", handleFormSubmit);