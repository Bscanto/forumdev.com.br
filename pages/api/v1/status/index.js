function status(request, response) {
  response.status(200).json({ status: 'São acima da média!' });
}

export default status;