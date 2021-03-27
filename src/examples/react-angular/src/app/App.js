import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container'

export default function App(props) {
	return (
		<React.Fragment>
			<Navbar variant="dark" bg="dark" fixed="top">
				<Navbar.Brand href="#">Egkyron (in React)</Navbar.Brand>
			</Navbar>
			<Container as="main">
				{props.children}
			</Container>
		</React.Fragment>
	);
}
