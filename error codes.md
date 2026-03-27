## 2xx Success
200 OK - Request completed successfully.
201 Created - Resource was created successfully.
202 Accepted - Request accepted for processing later.
203 Non-Authoritative Information - Returned metadata was modified by a proxy.
204 No Content - Request succeeded with no response body.
205 Reset Content - Request succeeded and client should reset the document view.
206 Partial Content - Server returned only the requested part of the resource.
207 Multi-Status - Response contains multiple status values for different operations.
208 Already Reported - Members of a DAV binding were already listed earlier.
226 IM Used - Server fulfilled the request using instance manipulations.

## 3xx Redirection
300 Multiple Choices - Request has multiple possible responses.
301 Moved Permanently - Resource was permanently moved to a new URL.
302 Found - Resource is temporarily available at a different URL.
303 See Other - Client should fetch the resource using GET at another URL.
304 Not Modified - Cached version is still valid, no body returned.
305 Use Proxy - Requested resource must be accessed through a proxy.
306 Unused - Status code reserved and no longer used.
307 Temporary Redirect - Resource is temporarily at another URL, keep same method.
308 Permanent Redirect - Resource moved permanently, keep same method.

## 4xx Client Error
400 Bad Request - Client sent invalid or malformed data.
401 Unauthorized - Authentication is required or invalid.
402 Payment Required - Reserved for future use, rarely implemented.
403 Forbidden - Server understood the request but refuses to authorize it.
404 Not Found - Requested resource could not be found.
405 Method Not Allowed - HTTP method is not allowed for this resource.
406 Not Acceptable - Server cannot return a response matching the Accept headers.
407 Proxy Authentication Required - Client must authenticate with the proxy.
408 Request Timeout - Client took too long to send the request.
409 Conflict - Request conflicts with current server state.
410 Gone - Resource no longer exists and will not return.
411 Length Required - Server requires a Content-Length header.
412 Precondition Failed - Request preconditions in headers were not met.
413 Content Too Large - Request body is too large for the server to process.
414 URI Too Long - Request URI is longer than the server accepts.
415 Unsupported Media Type - Request media type is not supported.
416 Range Not Satisfiable - Requested range cannot be fulfilled.
417 Expectation Failed - Server cannot meet the Expect header requirement.
418 I'm a teapot - April Fools status, sometimes used humorously.
421 Misdirected Request - Request was sent to a server unable to produce a response.
422 Unprocessable Content - Request format is valid but semantic validation failed.
423 Locked - Resource is locked and cannot be modified.
424 Failed Dependency - Request failed because a previous related request failed.
425 Too Early - Server refuses to process a replay-risk early request.
426 Upgrade Required - Client must switch to a different protocol.
428 Precondition Required - Server requires conditional request headers.
429 Too Many Requests - Client exceeded the allowed request rate.
431 Request Header Fields Too Large - Request headers are too large.
451 Unavailable For Legal Reasons - Resource is blocked due to legal restrictions.

## 5xx Server Error
500 Internal Server Error - Server failed while processing the request.
501 Not Implemented - Server does not support the requested functionality.
502 Bad Gateway - Gateway received an invalid response from upstream.
503 Service Unavailable - Server is temporarily unavailable or overloaded.
504 Gateway Timeout - Gateway timed out waiting for upstream response.
505 HTTP Version Not Supported - Server does not support the HTTP version used.
506 Variant Also Negotiates - Server configuration caused circular content negotiation.
507 Insufficient Storage - Server cannot store the representation needed to complete the request.
508 Loop Detected - Server detected an infinite loop while processing the request.
510 Not Extended - Further extensions to the request are required.
511 Network Authentication Required - Client must authenticate to gain network access.