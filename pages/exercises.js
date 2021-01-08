import { useForm } from "react-hook-form";
import Layout from "../components/layout";
import GraphQLClient from "../utils/graphQLClient";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { getExercisesQuery } from "../graphql/queries";
import { useRouter } from "next/router";
import { createExercise, deleteExercise } from "../graphql/mutations";
import {
  Box,
  Text,
  Grid,
  GridItem,
  Image,
  Center,
  VStack,
  Button,
  HStack,
  Input,
  useToast,
} from "@chakra-ui/react";
import _ from "lodash";

const fetcher = (...args) => GraphQLClient.request(...args);

const Exercises = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState();
  const [user, setUser] = useState();
  const [selectedBodyPart, setSelectedBodyPart] = useState("All");

  const { error, data } = useSWR(getExercisesQuery, fetcher);

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/me");
      console.log(res.status);
      if (res.status == 200) {
        const user = await res.json();
        setUser(user);
        console.log(user);
      } else {
        router.push("/");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (data) {
      setExercises(data.allExercises.data);
    }
  }, [data]);

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = handleSubmit(async (exercise) => {
    const { mutation, variables } = createExercise(
      user.userID,
      exercise.name,
      exercise.category,
      exercise.bodypart
    );

    try {
      const newExercise = await GraphQLClient.request(mutation, variables);
      setExercises((exercises) => [
        ...exercises,
        newExercise.createExerciseData,
      ]);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDeleteExercise = async (exerciseID) => {
    const { mutation, variables } = deleteExercise(exerciseID);

    try {
      const deletedExercise = await GraphQLClient.request(mutation, variables);
      console.log(deletedExercise);
      setExercises((exercises) => {
        return exercises.filter(
          (exercise) => exercise._id !== deletedExercise.deleteExerciseData._id
        );
      });
    } catch (error) {
      console.error(error);
    }
  };
  const renderBodyPart = (bodypart, image) => {
    return (
      <GridItem
        position="relative"
        boxShadow="lg"
        rounded="lg"
        verticalAlign="middle"
        borderRadius="10px"
        rowSpan={1}
        colSpan={1}
        _hover={{
          cursor: "pointer",
        }}
        onClick={() => setSelectedBodyPart(bodypart)}
      >
        <Center h={"100%"}>
          <Box
            borderRadius="10px"
            position="absolute"
            width="100%"
            height="100%"
            bg="grey"
            opacity={selectedBodyPart === bodypart ? 0 : 0.6}
            zIndex={20}
            _hover={{
              opacity: "0",
            }}
          />
          <Text
            position="absolute"
            zIndex={10}
            color="white"
            textAlign="center"
            fontSize={{ base: "md", md: "md", lg: "lg" }}
            m={1}
          >
            {bodypart}
          </Text>
          <Image
            borderRadius="10px"
            position="absolute"
            src={image}
            alt="abs"
            height="100%"
            width="100%"
          />
        </Center>
      </GridItem>
    );
  };

  const renderExercises = (exercises) => {
    var exerciseList;
    if (selectedBodyPart != "All") {
      exerciseList = _.filter(exercises, {
        bodypart: selectedBodyPart,
      });
    } else {
      exerciseList = exercises;
    }

    const noExercises = () => {
      return (
        <GridItem
          boxShadow="lg"
          rounded="lg"
          borderRadius="5px"
          h={"14rem"}
          colSpan={{ base: 6, md: 3, lg: 2 }}
        >
          <Center h={"100%"}>
            <Text
              textAlign="center"
              fontSize={{ base: "md", md: "md", lg: "lg" }}
              m={1}
            >
              You have no exercises for this body part. Fill out the form above
              to add exercises!
            </Text>
          </Center>
        </GridItem>
      );
    };

    const renderedExerciseList = exerciseList.map((exercise) => {
      return (
        <GridItem
          boxShadow="lg"
          rounded="lg"
          borderRadius="5px"
          h={"14rem"}
          colSpan={{ base: 6, md: 3, lg: 2 }}
        >
          <Center h={"100%"}>
            <VStack>
              <Text fontSize={{ base: "lg", md: "lg", lg: "xl" }} m={1}>
                {exercise.name}
              </Text>
              <Text
                color="grey"
                fontSize={{ base: "md", md: "md", lg: "lg" }}
                m={1}
              >
                {exercise.category}
              </Text>
              <Text
                color="grey"
                fontSize={{ base: "md", md: "md", lg: "lg" }}
                m={1}
              >
                {exercise.bodypart}
              </Text>
              <HStack>
                <Button colorScheme="teal">Edit</Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleDeleteExercise(exercise._id)}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          </Center>
        </GridItem>
      );
    });
    return renderedExerciseList.length != 0
      ? renderedExerciseList
      : noExercises();
  };

  const exersiceCreatedSuccess = (exerciseName) => {
    const toast = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: "Exercise Created.",
            description: `${exerciseName} has been added to your list of exercises!`,
            status: "success",
            duration: 9000,
            isClosable: true,
          })
        }
      >
        Show Success Toast
      </Button>
    );
  };

  return (
    <Layout user={user}>
      <Grid
        padding={4}
        h={{ base: "auto", md: "auto" }}
        autoRows="auto"
        templateColumns="repeat(6, 1fr)"
        gap={4}
      >
        <GridItem
          boxShadow="lg"
          rounded="lg"
          borderRadius="5px"
          rowSpan={1}
          colSpan={{ base: 6, md: 3, lg: 4 }}
        >
          <Text
            textAlign="right"
            fontSize="lg"
            m={1}
            _hover={{
              cursor: "pointer",
            }}
          >
            <h1>Body Parts</h1>
          </Text>
          <Grid
            padding={4}
            h="18rem"
            width="100%"
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={2}
          >
            {renderBodyPart("Core", "/images/abs.jpg")}
            {renderBodyPart("Chest", "/images/chest.jpg")}
            {renderBodyPart("Back", "/images/back.jpg")}
            {renderBodyPart("Biceps", "/images/biceps.jpg")}
            {renderBodyPart("Triceps", "/images/triceps.jpg")}
            {renderBodyPart("Shoulders", "/images/shoulders.jpg")}
            {renderBodyPart("Legs", "/images/legs.jpg")}
            {renderBodyPart("All", "/images/all.jpg")}
          </Grid>
        </GridItem>
        <GridItem
          boxShadow="lg"
          rounded="lg"
          borderRadius="5px"
          rowSpan={1}
          colSpan={{ base: 6, md: 3, lg: 2 }}
        >
          <Text textAlign="right" fontSize="lg" m={1}>
            <h1>Add Exercise</h1>
          </Text>
          <Box padding={2} width="100%">
            <form onSubmit={onSubmit}>
              <VStack>
                <Text
                  color="black"
                  fontSize={{ base: "md", md: "md", lg: "lg" }}
                  m={1}
                >
                  Exercise Name
                </Text>
                <Input
                  name="name"
                  placeholder="eg. Push Ups"
                  ref={register({ required: true })}
                />
                {errors.name && <span>Please enter the name</span>}
                <Text
                  color="black"
                  fontSize={{ base: "md", md: "md", lg: "lg" }}
                  m={1}
                >
                  Category
                </Text>
                <Input
                  name="category"
                  placeholder="eg. Barbell"
                  ref={register({ required: true })}
                />
                {errors.category && <span>Please enter the category</span>}
                <Text
                  color="black"
                  fontSize={{ base: "md", md: "md", lg: "lg" }}
                  m={1}
                >
                  Body Part
                </Text>
                <Input
                  name="bodypart"
                  placeholder="eg. Chest"
                  ref={register({ required: true })}
                />
                {errors.bodypart && <span>Please enter the body part</span>}
                <Button colorScheme="teal" type="submit">
                  Submit
                </Button>
              </VStack>
            </form>
          </Box>
        </GridItem>
        {exercises ? renderExercises(exercises) : <h1>Loading...</h1>}
      </Grid>
    </Layout>
  );
};

export default Exercises;