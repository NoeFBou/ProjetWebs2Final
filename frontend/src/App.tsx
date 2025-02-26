import './App.css'
import {Box, Button, Input, SimpleGrid, Text, VStack} from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, {useEffect, useState} from "react";
import Slider from "react-slick";


/*
const Slider = dynamic(() => import("react-slick").then((m) => m.default), {
    ssr: false
});*/

type SlideProps = {
    stock_name?: string,
    stock_industry?: string,
    stock_sector?: string,
    stock_market_cap?: string,
    department?: string,
    address?: string,
    id?: number,
    onDelete?: () => void;

};


const Slide = ({stock_name, stock_industry, stock_sector, stock_market_cap, department, address, onDelete}: SlideProps) => {
    return (
        <VStack
            w="１００％"
            h="300px"
            bg="#ef430e"
            border="cyan.700"
            alignContent="center"
            justifyContent="center"
            mx="4"
        >
            <Text color="white" fontWeight="bold">
                Stock Name : {stock_name}
            </Text>
            {stock_industry && (
                <Text color="white" fontWeight="bold">
                    Stock Industry : {stock_industry}
                </Text>
            )}
            {stock_sector && (
                <Text color="white" fontWeight="bold">
                    Stock Sector : {stock_sector}
                </Text>
            )}
            {stock_market_cap && (
                <Text color="white" fontWeight="bold">
                    Stock Market Cap : {stock_market_cap}
                </Text>
            )}
            {department && (
                <Text color="white" fontWeight="bold">
                    Department : {department}
                </Text>
            )}
            {address && (
                <Text color="white" fontWeight="bold">
                    Address : {address}
                </Text>
            )}
            {onDelete && (
                <Button colorScheme="red" onClick={onDelete}>
                    Delete
                </Button>
            )}

        </VStack>
    );
};



function App() {
    const [assignments, setAssignments] = useState([]);

    const [newAssignment, setNewAssignment] = useState({
        stock_name: "",
        stock_industry: "",
        stock_sector: "",
        stock_market_cap: "",
        department: "",
        address: ""
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = () => {
        fetch('http://localhost:5000/api/assignments')
            .then(response => response.json())
            .then(data => setAssignments(data))
            .catch(error =>
                console.error("Erreur lors de la récupération des données :", error)
            );
    };

    const slickSettings = {
       // dots: true,
        speed: 1000,
        autoplay: true,
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "60px",
        slidesToShow: 3,
        slidesToScroll: 1,
    };

    const handleInputChange = (e) => {

        const { name, value } = e.target;
        setNewAssignment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:5000/api/assignments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newAssignment)
        })
            .then(response => response.json())
            .then(data => {
                // Mise à jour du state pour afficher le nouvel assignement dans le slider
                setAssignments([...assignments, data]);
                setNewAssignment({
                    stock_name: "",
                    stock_industry: "",
                    stock_sector: "",
                    stock_market_cap: "",
                    department: "",
                    address: ""
                });
            })
            .catch(error =>
                console.error("Erreur lors de l'ajout de l'assignement :", error)
            );
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5000/api/assignments/${id}`, {
            method: "DELETE"
        })
            .then(response => response.json())
            .then(() => {
                // Mise à jour du state en retirant l'assignement supprimé
                setAssignments(assignments.filter(assignment => assignment.id !== id));
            })
            .catch(error =>
                console.error("Erreur lors de la suppression de l'assignement :", error)
            );
    };

    return (
        <div className="App">
            <Box m="20">
                <Box sx={{
                        ".slick-dots": {
                            transform: "translateY(1em)"
                        },
                        ".slick-dots li button": {
                            _before: {
                                transition: "0.2s",
                                content: "''",
                                borderRadius: "100%",
                                background: "cyan.500"
                            }
                        },
                        ".slick-arrow": {
                            backgroundColor: "#950d36",
                            color: "white",
                            w: "30px",
                            h: "50px",
                            transition: "0.2s",
                            _hover: {
                                backgroundColor: "#950d36",
                                color: "white"
                            },
                            _focus: {
                                backgroundColor: "#ef430e",
                                color: "white"
                            },
                            _before: {
                                transition: "0.2s"
                            }
                        },
                        ".slick-prev": {
                            left: "-40px",
                            _before: {
                                content: '"◀"'
                            }
                        },
                        ".slick-next": {
                            right: "-40px",
                            _before: {
                                content: '"▶"'
                            }
                        }
                    }}>
                    <Slider {...slickSettings}>
                        {assignments.length > 0 ? (
                            assignments.map((assignment : SlideProps) => (
                                <Slide
                                    key={assignment.id}
                                    stock_name={assignment.stock_name}
                                    stock_industry={assignment.stock_industry}
                                    stock_sector={assignment.stock_sector}
                                    stock_market_cap={assignment.stock_market_cap}
                                    department={assignment.department}
                                    address={assignment.address}
                                    onDelete={() => handleDelete(assignment.id)}
                                />
                            ))
                        ) : (
                            <Slide stock_name="Chargement..."/>
                        )}
                    </Slider>
                </Box>
            </Box>
            <SimpleGrid columns={2} columnGap="8" rowGap="5">
                <Input placeholder="Enter stock name" name="stock_name" value={newAssignment.stock_name} onChange={handleInputChange} />
                <Input placeholder="Enter stock industry" name="stock_industry" value={newAssignment.stock_industry} onChange={handleInputChange}/>
                <Input placeholder="Enter stock sector" name="stock_sector" value={newAssignment.stock_sector} onChange={handleInputChange}/>
                <Input placeholder="Enter stock market cap" name="stock_market_cap" value={newAssignment.stock_market_cap} onChange={handleInputChange}/>
                <Input placeholder="Enter department" name="department" value={newAssignment.department} onChange={handleInputChange} />
                <Input placeholder="Enter address" name="address" value={newAssignment.address} onChange={handleInputChange}/>
            </SimpleGrid>
            <Button mt={3} colorScheme="teal" size="md" onClick={handleSubmit} >
                Add Assignment
            </Button>
        </div>
    )
}

export default App
