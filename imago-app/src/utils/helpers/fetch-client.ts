export const fetchClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
	const res = await fetch(`/api${url}`, options);

	if (!res.ok) {
		throw new Error(`Request failed: ${res.status} ${res.statusText}`);
	}

	const body = [204, 205, 304].includes(res.status) ? null : await res.text();
	const data = body ? JSON.parse(body) : {};

	return { data, status: res.status, headers: res.headers } as T;
};
