import './App.css'
import {Box, HStack, Text} from "@chakra-ui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";
//import Slider from "react-slick";


const Slider = dynamic(() => import("react-slick").then((m) => m.default), {
    ssr: false
});

type SlideProps = {
    stock_name?: string,
    stock_industry?: string,
    stock_sector?: string,
    stock_market_cap?: string,
    department?: string,
    address?: string,
    id?: number
};


const Slide = ({stock_name, stock_industry, stock_sector, stock_market_cap, department, address, key}: SlideProps) => {
    return (
        <HStack
            w="１００％"
            h="200px"
            bg="#ef430e"
            border="cyan.700"
            alignContent="center"
            justifyContent="center"
            mx="4"
        >
            <Text color="white" fontWeight="bold">
                {stock_name}
            </Text>
            {stock_industry && (
                <Text color="white" fontWeight="bold">
                    {stock_industry}
                </Text>
            )}
            {stock_sector && (
                <Text color="white" fontWeight="bold">
                    {stock_sector}
                </Text>
            )}
            {stock_market_cap && (
                <Text color="white" fontWeight="bold">
                    {stock_market_cap}
                </Text>
            )}
            {department && (
                <Text color="white" fontWeight="bold">
                    {department}
                </Text>
            )}
            {address && (
                <Text color="white" fontWeight="bold">
                    {address}
                </Text>
            )}
        </HStack>
    );
};

function App() {

    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/assignments')
            .then(response => response.json())
            .then(data => setAssignments(data))
            .catch(error => console.error("Erreur lors de la récupération des données : ", error));
    }, []);

    const slickSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        autoplay: true,
        slidesToShow: 3
    };

    return (
        <div className="App">
            <Box m="20">
                <Box
                    sx={{
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
                    }}
                >
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
                                />
                            ))
                        ) : (
                            <Slide stock_name="Chargement..."/>
                        )}
                    </Slider>
                </Box>
            </Box>
        </div>
    )
}

export default App
