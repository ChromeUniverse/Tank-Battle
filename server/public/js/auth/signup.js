
async function postFormDataAsJson({ url, formData }) {
	const plainFormData = Object.fromEntries(formData.entries());
	const formDataJsonString = JSON.stringify(plainFormData);
	console.log('input here:', formDataJsonString);

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

	let redirect = false;

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

		// console.log('Here is the form data\n', formData);

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

const signup_form = document.getElementById("signup-form");
signup_form.addEventListener("submit", handleFormSubmit);